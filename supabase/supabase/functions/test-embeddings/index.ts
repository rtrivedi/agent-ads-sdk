/**
 * Test OpenAI embeddings via API
 * Verify OPENAI_API_KEY secret is working
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'OPENAI_API_KEY not found in environment',
          recommendation: 'Run: supabase secrets set OPENAI_API_KEY=sk-...'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const testText = "Help families organize wills, trusts, and inheritance planning";

    // Call OpenAI embeddings API
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: testText,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(
        JSON.stringify({
          success: false,
          message: 'OpenAI API request failed',
          status: response.status,
          error: error,
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    return new Response(
      JSON.stringify({
        success: true,
        message: '✅ OpenAI embeddings working!',
        test_input: testText,
        model: 'text-embedding-3-small',
        embedding_dimensions: embedding.length,
        embedding_sample: embedding.slice(0, 5),
        usage: data.usage,
        cost_estimate: `~$${(data.usage.total_tokens * 0.00000002).toFixed(6)}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Test embeddings error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'internal_error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
