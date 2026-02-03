# 🔒 Security Audit for GitHub Repository

## ⚠️ CRITICAL ISSUES - DO NOT COMMIT THESE:

### 1. **supabase/ folder** - MUST ADD TO .gitignore
**Risk Level: HIGH**

Contains:
- ❌ Database migration files with seeded test API keys
- ❌ Edge function source code (this is YOUR backend implementation)
- ❌ `.temp/` folder with database connection strings
- ❌ Project reference ID

**Why it's dangerous:**
- Exposes your backend implementation details
- Contains database schema (competitors could copy)
- Test API keys could be abused
- Database connection strings in `.temp/`

**Action:** Add to `.gitignore`

---

### 2. **Hardcoded Credentials in SDK Source**
**Risk Level: MEDIUM-HIGH**

**src/client.ts:**
```typescript
const DEFAULT_BASE_URL = 'https://peruwnbrqkvmrldhpoom.supabase.co/functions';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Why it's a problem:**
- Hardcodes YOUR infrastructure into the SDK
- All SDK users hit YOUR Supabase project by default
- Anon key exposure (though anon keys are meant to be public)
- Makes it impossible to change backend without SDK update

**Action:** Use environment variables or configuration

---

### 3. **Test Files with Real Credentials**
**Risk Level: MEDIUM**

Files:
- `test-production.ts` - Contains test API key
- `test-live-backend.ts` - Contains Supabase URL and anon key

**Action:** Add to `.gitignore` or sanitize

---

### 4. **Documentation with Infrastructure Details**
**Risk Level: LOW-MEDIUM**

Files:
- `PRODUCTION_GUIDE.md` - Contains project ref, URLs, test keys
- `DEVELOPER_INTEGRATION_GUIDE.md` - Contains example URLs

**Why it's a problem:**
- Exposes your Supabase project ID
- Shows test API keys
- Reveals infrastructure setup

**Action:** Create sanitized versions or add to `.gitignore`

---

## ✅ SAFE TO COMMIT (Already Public):

- ✅ `src/` folder (SDK source - but REMOVE hardcoded credentials)
- ✅ `README.md`
- ✅ `SECURITY.md`
- ✅ `LICENSE`
- ✅ `package.json`
- ✅ `tsconfig.json`
- ✅ Build configuration files

---

## 📝 Recommended .gitignore Updates

Add these lines to `.gitignore`:

```gitignore
# Supabase backend (private - not part of SDK)
supabase/

# Test files with real credentials
test-production.ts
test-live-backend.ts

# Production guides with infrastructure details
PRODUCTION_GUIDE.md
DEVELOPER_INTEGRATION_GUIDE.md
SECURITY_AUDIT.md

# Claude settings
.claude/
```

---

## 🔐 What CAN Be Public (Supabase Security Model):

### ✅ Supabase Anon Key - SAFE
**This is meant to be public!**
- Used in browser JavaScript
- Has Row Level Security (RLS) restrictions
- Cannot access service-level operations
- Cannot bypass database security policies

**Example:** Every frontend app embeds the anon key.

### ✅ Supabase Project URL - SAFE
**This is also public!**
- Every API call includes it
- Visible in browser network tab
- Not a secret

### ❌ Supabase Service Role Key - NEVER PUBLIC
**This should NEVER be committed!**
- Has full database access
- Bypasses Row Level Security
- Can delete/modify all data
- Only used in Edge Functions (server-side)

**Check:** Is this in any files?

---

## 🔍 Scan for Service Role Key (URGENT):

Run this command to check:

```bash
grep -r "SERVICE_ROLE_KEY\|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.*service_role" /Users/ronaktrivedi/Documents/AM_SDK --exclude-dir=node_modules --exclude-dir=.git
```

If found: **IMMEDIATELY ROTATE THE KEY** in Supabase dashboard.

---

## 🎯 Recommended Architecture Change

**Problem:** SDK hardcodes YOUR Supabase backend.

**Current flow:**
```
Developer installs SDK
  → SDK hits YOUR Supabase by default
  → YOUR infrastructure serves their ads
  → You pay for their usage
```

**Better approach (Platform Model):**

### Option A: Centralized Platform (Current)
This is fine IF you want to run a centralized ad platform where:
- You host the backend
- Developers just use the SDK
- You manage all infrastructure
- **BUT:** Remove hardcoded credentials, use auth properly

### Option B: Self-Hosted SDK (Future)
Let developers deploy their own Supabase backend:
```typescript
const client = new AttentionMarketClient({
  apiKey: 'am_live_...',
  baseUrl: 'https://their-own-backend.com', // They specify
  supabaseAnonKey: 'their-key',
});
```

---

## 🚀 Immediate Action Items

1. **Update .gitignore:**
   ```bash
   cat >> .gitignore << 'EOF'

   # AttentionMarket backend (private)
   supabase/
   test-production.ts
   test-live-backend.ts
   PRODUCTION_GUIDE.md
   DEVELOPER_INTEGRATION_GUIDE.md
   SECURITY_AUDIT.md
   .claude/
   EOF
   ```

2. **Remove hardcoded credentials from SDK:**
   - Make `DEFAULT_BASE_URL` configurable (required parameter)
   - Remove `DEFAULT_SUPABASE_ANON_KEY` (require in config)

3. **Check for service role key:**
   ```bash
   grep -r "service_role" /Users/ronaktrivedi/Documents/AM_SDK
   ```

4. **If you've already pushed these files:**
   - They're in Git history even if deleted
   - Rotate all credentials (API keys, Supabase keys)
   - Consider using BFG Repo Cleaner or git filter-branch

---

## 📊 Risk Assessment

| Item | Risk | Exploitable? | Mitigation |
|------|------|--------------|------------|
| Supabase URL | Low | No | Public by design |
| Anon Key | Low | Limited | RLS protects data |
| Service Role Key | **CRITICAL** | Yes | Never commit, rotate if exposed |
| Test API Keys | Medium | Yes | Rate limit, rotate |
| Edge Function Code | Medium | No | Intellectual property |
| Database Schema | Medium | No | Competitive intelligence |
| Test Files | Low | Limited | Remove before commit |

---

## ✅ Final Checklist Before Pushing to GitHub

- [ ] Add `supabase/` to `.gitignore`
- [ ] Add test files to `.gitignore`
- [ ] Add production guides to `.gitignore`
- [ ] Remove hardcoded Supabase URL from `src/client.ts`
- [ ] Remove hardcoded anon key from `src/client.ts`
- [ ] Scan for service role key
- [ ] Check git history for previously committed secrets
- [ ] Update SDK to require configuration
- [ ] Test SDK still works after changes

---

## 🆘 If Credentials Already Committed

1. **Rotate immediately:**
   - Regenerate all API keys in Supabase dashboard
   - Update production deployments
   - Revoke old keys

2. **Clean git history:**
   ```bash
   # Remove file from all commits
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch supabase/" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (if already pushed to GitHub)
   git push origin --force --all
   ```

3. **Enable GitHub secret scanning:**
   - Go to repo Settings → Security → Secret scanning
   - Enable alerts

---

**Bottom line:** The `supabase/` folder and hardcoded credentials should NOT be public. Everything else is mostly safe (anon key, project URL are meant to be public).
