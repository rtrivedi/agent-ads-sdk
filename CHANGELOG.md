# Changelog

All notable changes to the AttentionMarket SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.1] - 2026-02-04

### 🎉 Developer Onboarding Flow Complete

This release marks the completion of the full developer onboarding experience, enabling developers to sign up and integrate in under 5 minutes.

### Added

#### SDK Features
- **`buildTaxonomy()`** - Type-safe taxonomy builder that automatically validates and constructs hierarchical taxonomy strings
- **`detectIntent()`** - AI-powered intent detection that analyzes user queries to determine journey stage (research, compare, quote, apply, etc.)
- **`suggestTaxonomies()`** - Smart taxonomy suggester that maps user queries to relevant taxonomy categories

#### Developer Signup Flow
- **Web-based signup form** - Lovable.dev React component at attentionmarket.com/signup
- **Instant API key generation** - Developers receive test and live API keys immediately upon signup
- **No dashboard required** - Zero-friction MVP flow (email + agent name → keys in 30 seconds)
- **Copy-to-clipboard UX** - Easy key copying with visual feedback

#### Backend Infrastructure (All Deployed & Active)
- **`/agent-signup`** - Developer registration endpoint (v5)
- **`/decide`** - Ad serving API with hierarchical taxonomy matching (v8)
- **`/event`** - Unified click/impression tracking (v4)
- **`/policy`** - Campaign policy retrieval (v3)
- **`/click`** - Legacy click tracking (v1)
- **`/campaign-create`** - Advertiser campaign creation (v3)
- **`/agent-stats`** - Developer revenue dashboard data (v2)
- **`/advertiser-signup`** - Advertiser registration (v2)
- **`/advertiser-stats`** - Advertiser campaign analytics (v2)

### Changed

#### Phase 1 Taxonomy Migration (BREAKING CHANGE)
Migrated from flat taxonomy structure to hierarchical 4-level system with 50 high-value categories:

**Old Format (Deprecated)**:
```typescript
taxonomy: 'shopping.ecommerce.platform'
```

**New Format (Phase 1)**:
```typescript
taxonomy: 'business.ecommerce.platform.trial'
//         └──┬───┘ └───┬───┘ └───┬───┘ └─┬──┘
//         vertical  category  subcategory intent
```

**Migration Impact**:
- All documentation updated to Phase 1 taxonomies
- README.md completely rewritten with new examples
- SIMPLE_INTEGRATION_GUIDE.md updated (3 taxonomy instances)
- Helper functions added to ease migration

**Phase 1 Categories by Vertical**:
- **Insurance** (6): auto, home, life, health, business, travel
- **Legal** (5): family, immigration, criminal, estate, business
- **Financial** (8): loans, credit cards, investment, banking, tax, accounting, mortgages, debt relief
- **Home Services** (6): moving, HVAC, plumbing, roofing, cleaning, landscaping
- **Business** (10): formation, accounting, marketing, CRM, ecommerce, analytics, HR, legal, insurance, productivity
- **Health & Wellness** (7): fitness, nutrition, mental health, telehealth, medical devices, alternative medicine, beauty
- **Education** (4): courses, certifications, tutoring, language learning
- **Travel** (4): flights, hotels, car rentals, travel insurance

#### Documentation Overhaul
- **README.md** - Complete rewrite featuring:
  - Signup URL prominently at top
  - Phase 1 taxonomy examples throughout
  - Helper function documentation (buildTaxonomy, detectIntent, suggestTaxonomies)
  - Hierarchical matching explanation
  - Common taxonomies by vertical with CPC ranges ($2-50)
  - Complete integration examples

- **SIMPLE_INTEGRATION_GUIDE.md** - Updated for new developer flow:
  - Replaced curl-based signup with website signup URL
  - Updated all taxonomy examples to Phase 1 format
  - Clearer step-by-step instructions
  - 30-second signup promise

- **LOVABLE_INTEGRATION.md** - New file documenting:
  - Supabase Edge Function authentication
  - Authorization Bearer header requirements
  - React component integration patterns

### Technical Details

#### Hierarchical Taxonomy Matching
Advertisers can now target broad categories while agents request specific intents:

```typescript
// Advertiser targets broad category
targeting: { taxonomy: 'insurance.auto' }

// Agent requests specific intent
opportunity: { intent: { taxonomy: 'insurance.auto.full_coverage.quote' } }

// ✅ MATCH - Hierarchical matching allows broad → specific
```

#### Intent Detection Algorithm
The SDK now auto-detects user intent from natural language:

```typescript
detectIntent("I need car insurance") → "research"
detectIntent("compare State Farm vs Geico") → "compare"
detectIntent("get a quote for Honda Civic") → "quote"
detectIntent("apply for coverage now") → "apply"
```

#### Supabase Integration
- **Edge Functions**: All 9 backend functions deployed to Supabase
- **Database**: PostgreSQL with `agents` and `advertisers` tables
- **Authentication**: Anon key + Authorization Bearer headers
- **CORS**: Configured for attentionmarket.com origin

### Fixed

- **401 Authorization Errors** - Fixed Lovable component to use correct `Authorization: Bearer` header format (not `apikey`)
- **Taxonomy Deprecation** - Removed all references to old taxonomy format from docs
- **Git Ignore** - Added dist/ directory to prevent build artifacts in version control

### Developer Experience

**Time to First Ad**: ~5 minutes total
1. Sign up (30 seconds) → Get API keys
2. Install SDK (30 seconds) → `npm install @the_ro_show/agent-ads-sdk`
3. Copy example code (2 minutes) → Initialize client + request ad
4. Test (2 minutes) → See Pietra ad for e-commerce query

**AI Assistant Integration**:
- Claude Code, Cursor, Gemini Code Assist can now guide developers through integration
- Clear signup URL at top of README
- Step-by-step instructions with copy-paste examples
- Helper functions reduce boilerplate

### Performance

- **SDK Bundle Size**: ~50KB minified
- **API Response Time**: <200ms p95 for `/decide` endpoint
- **Edge Function Cold Start**: <500ms
- **Geographic Coverage**: Global (Supabase Edge Network)

### Security

- **API Key Format**:
  - Test keys: `am_test_[32_char_hash]`
  - Live keys: `am_live_[32_char_hash]`
- **Environment Variables**: All docs emphasize `.env` storage (never commit keys)
- **Key Rotation**: Not yet implemented (MVP accepts lost keys = contact support)

### Known Limitations (MVP)

- **No Key Retrieval**: If developer loses keys, must contact support or create new account
- **No Developer Dashboard**: Keys displayed once on signup, then gone
- **Single Email**: One email = one account (no duplicate signup check beyond DB constraint)

### What's Next

**Advertiser Onboarding** (Next Phase):
- Campaign creation form on Lovable site
- Advertiser dashboard with analytics
- Budget management and billing

**Developer Enhancements** (Future):
- Dashboard with revenue stats, traffic analytics
- Key retrieval via email verification
- Multi-agent management per account
- Webhook notifications for high-value events

---

## [0.4.0] - 2026-02-03

### Added
- Initial Phase 1 taxonomy system (50 categories)
- Helper functions: `buildTaxonomy()`, `detectIntent()`, `suggestTaxonomies()`
- Hierarchical taxonomy matching in `/decide` endpoint

### Changed
- Backend functions migrated to new taxonomy format
- Database schema updated for hierarchical targeting

---

## [0.3.0] - 2026-02-01

### Added
- Initial backend implementation
- Supabase Edge Functions for ad serving
- PostgreSQL database schema
- Basic tracking endpoints

---

## [0.2.0] - 2026-01-30

### Added
- Core SDK client
- TypeScript type definitions
- Basic ad request/response handling

---

## [0.1.0] - 2026-01-28

### Added
- Initial SDK scaffold
- NPM package setup
- Basic documentation
