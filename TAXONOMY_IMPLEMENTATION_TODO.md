# Taxonomy System Implementation TODO

## Overview
Checklist for implementing the new 4-tier revenue-optimized taxonomy system.

---

## ✅ Completed

1. **Taxonomy design** - TAXONOMY_SYSTEM.md
2. **Migration guide** - TAXONOMY_MIGRATION_GUIDE.md
3. **Database schema** - No changes needed (already TEXT[])

---

## 🔧 Backend Updates Required

### 1. Update decide function - Hierarchical Matching Logic

**File:** `supabase/supabase/functions/decide/index.ts`

**Current Problem (Line 96):**
```typescript
.contains('campaigns.targeting_taxonomies', [taxonomy])
// Only matches EXACT taxonomy
```

**Current Problem (Line 146):**
```typescript
if (campaign.targeting_taxonomies?.includes(taxonomy)) {
  relevance = 1.0;
}
// Only exact match, no hierarchical matching
```

**Solution:**
Replace exact matching with hierarchical prefix matching:

```typescript
// Line 96: Fetch broader set of campaigns
// Instead of exact match, fetch campaigns that match any prefix
const taxonomyParts = taxonomy.split('.');
const broadTaxonomy = taxonomyParts[0]; // Get vertical (e.g., "insurance")

const { data: adUnits, error: queryError } = await supabase
  .from('ad_units')
  .select(`...`)
  .eq('status', 'active')
  .eq('campaigns.status', 'active')
  .eq('unit_type', placement.type)
  // Fetch all campaigns in this vertical (will filter in code)
  .filter('campaigns.targeting_taxonomies', 'cs', `{${broadTaxonomy}}`) // cs = contains (any element starts with)
  .limit(100); // Increased limit for broader matching

// Line 146: Replace with hierarchical matching
function calculateTaxonomyRelevance(requestedTaxonomy: string, targetedTaxonomies: string[]): number {
  let maxRelevance = 0;

  for (const targeted of targetedTaxonomies) {
    const relevance = getTaxonomyMatchScore(requestedTaxonomy, targeted);
    if (relevance > maxRelevance) {
      maxRelevance = relevance;
    }
  }

  return maxRelevance;
}

function getTaxonomyMatchScore(requested: string, targeted: string): number {
  // Exact match
  if (requested === targeted) {
    return 1.0;
  }

  const requestedParts = requested.split('.');
  const targetedParts = targeted.split('.');

  // Check if targeted is a prefix of requested
  // Example: targeted="insurance.auto" matches requested="insurance.auto.full_coverage.quote"
  let matchingLevels = 0;
  for (let i = 0; i < targetedParts.length; i++) {
    if (requestedParts[i] === targetedParts[i]) {
      matchingLevels++;
    } else {
      break;
    }
  }

  // Calculate relevance based on matching depth
  if (matchingLevels === 0) return 0;
  if (matchingLevels === 1) return 0.5; // Vertical match only (e.g., "insurance")
  if (matchingLevels === 2) return 0.7; // Category match (e.g., "insurance.auto")
  if (matchingLevels === 3) return 0.9; // Subcategory match (e.g., "insurance.auto.full_coverage")
  if (matchingLevels === 4) return 1.0; // Exact match (all 4 tiers)

  return 0;
}

// Replace line 146 with:
const relevance = calculateTaxonomyRelevance(
  taxonomy,
  campaign.targeting_taxonomies || []
);
```

**Why this matters:**
- Advertiser targets: `insurance.auto`
- Agent requests: `insurance.auto.full_coverage.quote`
- Old system: ❌ No match (0 relevance)
- New system: ✅ Match (0.7 relevance)

---

### 2. Add Backward Compatibility Layer (30-day deprecation)

**File:** `supabase/supabase/functions/decide/index.ts`

Add at the top of the function:

```typescript
// OLD → NEW taxonomy mapping (remove after 90 days)
const DEPRECATED_TAXONOMIES: Record<string, string> = {
  'shopping.ecommerce.platform': 'business.ecommerce.platform.trial',
  'local_services.movers.quote': 'home_services.moving.local.quote',
  'local_services.plumbers.quote': 'home_services.plumbing.emergency.quote',
  'local_services.electricians.quote': 'home_services.electrical.repair.quote',
  'local_services.cleaning': 'home_services.cleaning.regular.book',
  'local_services.contractors.home': 'home_services.remodeling.kitchen.quote',
  'business.productivity.tools': 'business.saas.project_management.trial',
  'business.software.ecommerce': 'business.ecommerce.platform.trial',
  'business.startup.tools': 'business.saas.crm.trial',
  // Add all mappings from TAXONOMY_MIGRATION_GUIDE.md
};

// Auto-migrate old taxonomies (with warning)
if (DEPRECATED_TAXONOMIES[taxonomy]) {
  console.warn(`⚠️  DEPRECATED: Taxonomy '${taxonomy}' is deprecated. Use '${DEPRECATED_TAXONOMIES[taxonomy]}' instead. Old taxonomies will be removed on 2026-05-04.`);

  // Auto-convert for now
  taxonomy = DEPRECATED_TAXONOMIES[taxonomy];

  // Add warning header to response (line ~230)
  // response.headers.set('X-Taxonomy-Warning', `Deprecated taxonomy used. Migrate to: ${taxonomy}`);
}
```

---

### 3. Update campaign-create validation

**File:** `supabase/supabase/functions/campaign-create/index.ts`

Add taxonomy format validation:

```typescript
// After line 83 (validate required fields)
// Add taxonomy validation

function isValidTaxonomy(taxonomy: string): boolean {
  // Must be 3 or 4 parts (vertical.category.subcategory[.intent])
  const parts = taxonomy.split('.');
  if (parts.length < 3 || parts.length > 4) {
    return false;
  }

  // Check valid intent (if present)
  const validIntents = ['research', 'compare', 'quote', 'trial', 'book', 'apply', 'consultation'];
  if (parts.length === 4 && !validIntents.includes(parts[3])) {
    return false;
  }

  // Check each part is non-empty
  return parts.every(part => part.length > 0);
}

// Validate taxonomies
for (const taxonomy of targeting_taxonomies) {
  if (!isValidTaxonomy(taxonomy)) {
    return new Response(
      JSON.stringify({
        error: 'validation_error',
        message: `Invalid taxonomy format: '${taxonomy}'. Must be 'vertical.category.subcategory[.intent]'. See TAXONOMY_SYSTEM.md for valid taxonomies.`
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

---

## 📱 SDK Updates (Optional but Recommended)

### 1. Add Taxonomy Helper Utilities

**New File:** `src/taxonomy-utils.ts`

```typescript
/**
 * Taxonomy helper utilities for AttentionMarket SDK
 */

// Valid intent modifiers
export type TaxonomyIntent =
  | 'research'    // Learning, browsing
  | 'compare'     // Evaluating options
  | 'quote'       // Getting prices
  | 'trial'       // Free trial signup
  | 'book'        // Schedule/purchase
  | 'apply'       // Application process
  | 'consultation'; // Schedule meeting

/**
 * Build a valid taxonomy string
 */
export function buildTaxonomy(
  vertical: string,
  category: string,
  subcategory: string,
  intent?: TaxonomyIntent
): string {
  const parts = [vertical, category, subcategory];
  if (intent) {
    parts.push(intent);
  }
  return parts.join('.');
}

/**
 * Detect user intent from query string
 */
export function detectIntent(query: string): TaxonomyIntent {
  const lowerQuery = query.toLowerCase();

  // Research intent
  if (/what is|how does|learn about|tell me about|explain/i.test(lowerQuery)) {
    return 'research';
  }

  // Compare intent
  if (/best|compare|vs|versus|which|top|options|alternatives/i.test(lowerQuery)) {
    return 'compare';
  }

  // Quote intent
  if (/price|cost|how much|quote|estimate|pricing/i.test(lowerQuery)) {
    return 'quote';
  }

  // Trial intent
  if (/try|demo|free trial|test|preview/i.test(lowerQuery)) {
    return 'trial';
  }

  // Book intent
  if (/book|schedule|appointment|reserve|set up/i.test(lowerQuery)) {
    return 'book';
  }

  // Apply intent
  if (/apply|sign up|get started|register|enroll/i.test(lowerQuery)) {
    return 'apply';
  }

  // Consultation intent
  if (/talk to|speak with|consult|meet with|call/i.test(lowerQuery)) {
    return 'consultation';
  }

  // Default to compare
  return 'compare';
}

/**
 * Validate taxonomy format
 */
export function isValidTaxonomy(taxonomy: string): boolean {
  const parts = taxonomy.split('.');

  // Must be 3 or 4 parts
  if (parts.length < 3 || parts.length > 4) {
    return false;
  }

  // Check valid intent (if present)
  const validIntents: TaxonomyIntent[] = [
    'research', 'compare', 'quote', 'trial',
    'book', 'apply', 'consultation'
  ];

  if (parts.length === 4 && !validIntents.includes(parts[3] as TaxonomyIntent)) {
    return false;
  }

  // Check each part is non-empty and alphanumeric + underscore
  return parts.every(part => /^[a-z0-9_]+$/.test(part));
}

/**
 * Parse taxonomy into components
 */
export interface ParsedTaxonomy {
  vertical: string;
  category: string;
  subcategory: string;
  intent?: TaxonomyIntent;
  full: string;
}

export function parseTaxonomy(taxonomy: string): ParsedTaxonomy | null {
  if (!isValidTaxonomy(taxonomy)) {
    return null;
  }

  const parts = taxonomy.split('.');
  return {
    vertical: parts[0],
    category: parts[1],
    subcategory: parts[2],
    intent: parts[3] as TaxonomyIntent | undefined,
    full: taxonomy
  };
}
```

### 2. Export from SDK

**File:** `src/index.ts`

```typescript
// Add to exports
export {
  buildTaxonomy,
  detectIntent,
  isValidTaxonomy,
  parseTaxonomy,
  type TaxonomyIntent,
  type ParsedTaxonomy
} from './taxonomy-utils';
```

### 3. Update SDK Examples

Update all example files to use new taxonomies:
- `examples/claude-tool-use-full.ts`
- `examples/openai-function-calling-full.ts`
- `examples/gemini-function-calling-full.ts`
- `README.md` examples

Replace:
```typescript
taxonomy: 'local_services.movers.quote'
```

With:
```typescript
taxonomy: 'home_services.moving.local.quote'
```

---

## 📚 Documentation Updates

### 1. Update Main README

**File:** `README.md`

- Replace all old taxonomy examples with new format
- Add link to TAXONOMY_SYSTEM.md
- Add link to TAXONOMY_MIGRATION_GUIDE.md

### 2. Update Integration Guides

**Files to update:**
- `SIMPLE_INTEGRATION_GUIDE.md`
- `DEVELOPER_INTEGRATION_GUIDE.md`
- `LOVABLE_API_INTEGRATION.md`
- `INTEGRATION_PATTERNS.md`

Replace taxonomy examples with new format.

### 3. Create AI_IMPLEMENTATION_GUIDE.md

New guide optimized for LLMs to implement SDK (your original ask).

---

## 🧪 Testing Required

### 1. Test Hierarchical Matching

```typescript
// Test that these all match:
Advertiser targets: 'insurance.auto'
Agent requests:
  ✅ 'insurance.auto.full_coverage.quote' → 0.7 relevance
  ✅ 'insurance.auto.liability.quote' → 0.7 relevance
  ✅ 'insurance.auto.full_coverage.research' → 0.7 relevance
```

### 2. Test Exact Matching

```typescript
// Test exact match gets higher score
Advertiser targets: 'insurance.auto.full_coverage.quote'
Agent requests:
  ✅ 'insurance.auto.full_coverage.quote' → 1.0 relevance
  ✅ 'insurance.auto.full_coverage.apply' → 0 relevance (different intent)
```

### 3. Test Backward Compatibility

```typescript
// Old taxonomy should auto-convert with warning
Agent requests: 'shopping.ecommerce.platform'
Result:
  ✅ Auto-converts to 'business.ecommerce.platform.trial'
  ✅ Warning logged
  ✅ Response header 'X-Taxonomy-Warning' set
```

---

## 📅 Timeline

### Week 1: Backend Updates
- [ ] Update decide function with hierarchical matching
- [ ] Add backward compatibility layer
- [ ] Update campaign-create validation
- [ ] Test matching logic

### Week 2: SDK Updates (Optional)
- [ ] Add taxonomy-utils.ts
- [ ] Update examples
- [ ] Test new utilities

### Week 3: Documentation
- [ ] Update README and guides
- [ ] Create AI_IMPLEMENTATION_GUIDE.md
- [ ] Create advertiser taxonomy guide

### Week 4: Migration & Launch
- [ ] Deploy backend changes
- [ ] Announce migration (90-day timeline)
- [ ] Monitor for issues
- [ ] Support early adopters

---

## Priority Order

1. **Critical (Do First):**
   - ✅ Taxonomy design (done)
   - ✅ Migration guide (done)
   - ⚠️ Update decide function (hierarchical matching)
   - ⚠️ Backward compatibility layer

2. **Important (Do Soon):**
   - Update campaign-create validation
   - SDK taxonomy utilities
   - Update documentation

3. **Nice to Have:**
   - Advanced intent detection
   - Taxonomy suggestion API
   - Auto-migration tool for advertisers

---

## Questions to Resolve

1. **Database query performance** - Fetching all campaigns in a vertical (line 96) might be slow at scale. Should we:
   - Use full-text search?
   - Add GIN index on taxonomies?
   - Pre-compute taxonomy prefixes?

2. **Intent defaults** - If taxonomy has no intent (e.g., `insurance.auto`), should we:
   - Default to `.compare`?
   - Match all intents?
   - Require intent always?

3. **Deprecation timeline** - Is 90 days enough?
   - 30 days warning
   - 90 days removal

4. **Validation strictness** - Should we reject invalid taxonomies or allow any format?
   - Strict: Only allow pre-approved taxonomies
   - Flexible: Allow any format (validate structure only)
   - Current approach: Validate format, allow any content

---

## Success Metrics

- [ ] All existing campaigns migrated to new format
- [ ] Hierarchical matching working (test cases pass)
- [ ] No increase in no_fill rate
- [ ] Backward compatibility working (old taxonomies auto-convert)
- [ ] Documentation updated
- [ ] Zero breaking changes for existing integrations
