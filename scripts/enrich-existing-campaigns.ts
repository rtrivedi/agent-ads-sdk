#!/usr/bin/env node
/**
 * Script to enrich all existing campaigns without embeddings
 * Run this once to fix all campaigns created before auto-enrichment was added
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU';
const ENRICH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/enrich-campaign`;

// You'll need to set this environment variable with a service role key
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  console.log('Please set it with: export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Enrich a single campaign
 */
async function enrichCampaign(campaignId: string): Promise<boolean> {
  try {
    console.log(`  Enriching campaign ${campaignId}...`);

    const response = await fetch(ENRICH_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campaign_id: campaignId }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  ❌ Failed to enrich ${campaignId}: ${error}`);
      return false;
    }

    const result = await response.json();
    console.log(`  ✅ Successfully enriched ${campaignId}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error enriching ${campaignId}:`, error);
    return false;
  }
}

/**
 * Main function to enrich all campaigns
 */
async function enrichAllCampaigns() {
  console.log('🚀 Starting campaign enrichment process...\n');

  // Find all campaigns without embeddings
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, name, created_at')
    .is('intent_embedding', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch campaigns:', error);
    process.exit(1);
  }

  if (!campaigns || campaigns.length === 0) {
    console.log('✅ All campaigns already have embeddings!');
    return;
  }

  console.log(`Found ${campaigns.length} campaigns without embeddings:\n`);

  campaigns.forEach((campaign, index) => {
    console.log(`${index + 1}. ${campaign.name} (${campaign.id})`);
    console.log(`   Created: ${campaign.created_at}`);
  });

  console.log('\n📊 Starting enrichment...\n');

  let successCount = 0;
  let failCount = 0;

  // Process campaigns with rate limiting
  for (const campaign of campaigns) {
    const success = await enrichCampaign(campaign.id);

    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    // Rate limit: wait 1 second between requests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📈 Enrichment Complete!\n');
  console.log(`✅ Successfully enriched: ${successCount} campaigns`);
  if (failCount > 0) {
    console.log(`❌ Failed to enrich: ${failCount} campaigns`);
  }

  // Verify the enrichment
  console.log('\n🔍 Verifying enrichment...\n');

  const { data: stillUnenriched, error: verifyError } = await supabase
    .from('campaigns')
    .select('id, name')
    .is('intent_embedding', null);

  if (verifyError) {
    console.error('Failed to verify:', verifyError);
  } else if (stillUnenriched && stillUnenriched.length > 0) {
    console.log(`⚠️  ${stillUnenriched.length} campaigns still need enrichment:`);
    stillUnenriched.forEach(campaign => {
      console.log(`   - ${campaign.name} (${campaign.id})`);
    });
  } else {
    console.log('🎉 All campaigns now have embeddings!');
  }
}

// Run the script
enrichAllCampaigns().catch(console.error);