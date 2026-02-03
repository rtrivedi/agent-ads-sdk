# 🚀 START HERE: Two-Team Setup Overview

Quick guide to set up AttentionMarket ads with **separate teams** managing separate infrastructure.

---

## 📋 Which Guide Do I Need?

### 👥 **I'm on the API/SDK Team**
→ Read **`TEAM_SETUP.md`** (Team 1 section)

**Your job:**
1. Create new Supabase project: `attentionmarket-api`
2. Deploy Edge Functions (this folder)
3. Set AttentionMarket credentials (secrets)
4. Give Team 2 these two things:
   - API URL: `https://xxxxx.supabase.co/functions/v1`
   - Anon Key: `eyJhbGci...`

**Time:** ~15 minutes

---

### 📱 **I'm on the iOS App Team**
→ Read **`QUICKSTART.md`**

**Your job:**
1. Get credentials from API team (URL + key)
2. Add `AttentionMarketAPI.swift` to your iOS app
3. Display ads using `AdView`
4. Test and ship!

**Time:** ~30 minutes

---

## 🏗️ Architecture (Simple View)

```
API Team's Supabase Project
    ↓
Edge Functions (get-ad, track-*)
    ↓
    │ (Provides clean API)
    ↓
iOS App (just calls HTTP endpoints)
    ↓
App Team's Supabase Project
```

**Key Point:** Teams work independently. API team can update Edge Functions without touching the iOS app. iOS team can update app without touching API infrastructure.

---

## 📁 File Guide

| File | Who Reads It | Purpose |
|------|--------------|---------|
| **START_HERE.md** | Everyone | You are here! Quick overview |
| **TEAM_SETUP.md** | API Team | Complete setup for both teams |
| **QUICKSTART.md** | iOS Team | Fast iOS integration guide |
| **HANDOFF_TO_APP_TEAM.md** | API Team | Template to give iOS team credentials |
| **README.md** | Both | Full documentation & troubleshooting |

---

## ⚡ Quick Start Commands

### For API Team:
```bash
# 1. Create Supabase project at supabase.com
# 2. Link and deploy
cd supabase
supabase link --project-ref YOUR_NEW_PROJECT_ID
supabase secrets set ATTENTIONMARKET_API_KEY=am_live_...
supabase secrets set ATTENTIONMARKET_AGENT_ID=agt_...
supabase functions deploy

# 3. Get credentials to share
supabase status
```

### For iOS Team:
```swift
// 1. Get these from API team
let apiURL = "https://xxxxx.supabase.co/functions/v1"
let apiKey = "eyJhbGci..."

// 2. Add AttentionMarketAPI.swift to Xcode
// 3. Use it:
let ad = try await api.getAd(taxonomy: "local_services.movers.quote")
```

---

## ✅ What You Get

**Clean separation:**
- ✅ API team owns Edge Functions
- ✅ iOS team owns app code
- ✅ No overlap or confusion
- ✅ Independent deployments
- ✅ Clear ownership boundaries

**Security:**
- ✅ API key never in iOS app
- ✅ XSS/phishing protection built-in
- ✅ Separate access controls

**Scalability:**
- ✅ API can serve multiple apps
- ✅ Teams can scale independently
- ✅ Easy to add new features

---

## 🎯 Next Steps

1. **Decide your role:** API team or iOS team?
2. **Read your guide:** TEAM_SETUP.md or QUICKSTART.md
3. **Follow the steps:** Takes 15-30 minutes
4. **Test it works:** curl for API team, Xcode for iOS team
5. **Ship it!** 🚀

---

## 💡 Need Help?

- **Setup questions:** See `TEAM_SETUP.md` → Troubleshooting
- **API questions:** See `README.md` → Full docs
- **iOS questions:** See `QUICKSTART.md` → iOS integration
- **Still stuck:** Open issue at https://github.com/rtrivedi/agent-ads-sdk/issues

---

**Ready? Pick your guide and let's go!** 🚀
