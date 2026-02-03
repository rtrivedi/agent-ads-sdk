/**
 * Shared authentication utilities for Edge Functions
 * Validates AttentionMarket API keys (am_live_* or am_test_*)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export interface AuthResult {
  authenticated: boolean;
  agent_id?: string;
  environment?: 'test' | 'live';
  error?: string;
}

/**
 * Validate AttentionMarket API key from X-AM-API-Key header
 * Returns agent details if valid, error if invalid
 */
export async function validateAPIKey(req: Request): Promise<AuthResult> {
  // Extract API key from custom header (to avoid conflict with Supabase JWT)
  const apiKey = req.headers.get('X-AM-API-Key');

  if (!apiKey) {
    return {
      authenticated: false,
      error: 'Missing X-AM-API-Key header. Include: X-AM-API-Key: am_live_... or am_test_...',
    };
  }

  // Validate API key format
  if (!apiKey.startsWith('am_live_') && !apiKey.startsWith('am_test_')) {
    return {
      authenticated: false,
      error: 'Invalid API key format. Must start with am_live_ or am_test_',
    };
  }

  const environment = apiKey.startsWith('am_live_') ? 'live' : 'test';

  // Query database for API key
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const column = environment === 'live' ? 'api_key_live' : 'api_key_test';

  const { data: agent, error } = await supabase
    .from('agents')
    .select('agent_id, status, environment')
    .eq(column, apiKey)
    .single();

  if (error || !agent) {
    return {
      authenticated: false,
      error: 'Invalid API key. Agent not found.',
    };
  }

  if (agent.status !== 'active') {
    return {
      authenticated: false,
      error: `Agent is ${agent.status}. Contact support@attentionmarket.ai`,
    };
  }

  return {
    authenticated: true,
    agent_id: agent.agent_id,
    environment,
  };
}

/**
 * Create error response for authentication failures
 */
export function createAuthErrorResponse(authResult: AuthResult, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: 'authentication_failed',
      message: authResult.error,
    }),
    {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
