# 📋 API Credentials Handoff

**From:** API/SDK Team
**To:** iOS App Team
**Date:** [Fill in deployment date]

---

## 🔑 API Credentials

```swift
// Add these to your iOS app
let attentionMarketAPIURL = "https://YOUR_API_PROJECT_ID.supabase.co/functions/v1"
let attentionMarketAPIKey = "YOUR_API_ANON_KEY"
```

**Replace:**
- `YOUR_API_PROJECT_ID` with: ___________________________
- `YOUR_API_ANON_KEY` with: ___________________________

---

## 📡 Available Endpoints

### 1. Get Ad
```
POST {apiURL}/get-ad
Authorization: Bearer {apiKey}
Content-Type: application/json

Body:
{
  "taxonomy": "local_services.movers.quote",
  "query": "Find movers in Brooklyn",
  "userLocation": {
    "country": "US",
    "language": "en"
  }
}

Response:
{
  "ad": { ... } | null
}
```

### 2. Track Impression
```
POST {apiURL}/track-impression
Authorization: Bearer {apiKey}
Content-Type: application/json

Body:
{
  "requestId": "...",
  "decisionId": "...",
  "unitId": "...",
  "token": "..."
}

Response:
{
  "success": true,
  "accepted": true
}
```

### 3. Track Click
```
POST {apiURL}/track-click
Authorization: Bearer {apiKey}
Content-Type: application/json

Body:
{
  "requestId": "...",
  "decisionId": "...",
  "unitId": "...",
  "token": "...",
  "actionUrl": "https://..."
}

Response:
{
  "success": true,
  "accepted": true
}
```

---

## 📱 iOS Integration Code

See `QUICKSTART.md` for complete Swift implementation.

Quick summary:
1. Create `AttentionMarketAPI.swift` with credentials above
2. Call `api.getAd()` to fetch ads
3. Display ad with `AdView(ad: ad)`
4. Impressions/clicks are tracked automatically

---

## 🐛 Support

**If something breaks:**
1. Check API status: [Supabase Dashboard Link]
2. Contact API team: [Team contact]
3. Check logs in your iOS app

**Common issues:**
- Wrong API URL → Double check project ID
- 401 Unauthorized → Check anon key is correct
- No ads returned → Normal! Means no campaigns available

---

## 📊 API Uptime & Status

- **Status Page:** [Link to Supabase status]
- **Monitoring:** [Link to monitoring dashboard if available]
- **SLA:** 99.9% uptime

---

## 🔄 Version

**Current API Version:** v1
**Last Updated:** [Date]

---

## ✅ Checklist for App Team

- [ ] Added credentials to iOS app
- [ ] Tested `get-ad` endpoint
- [ ] Tested `track-impression` endpoint
- [ ] Tested `track-click` endpoint
- [ ] Verified ads display correctly
- [ ] Verified tracking works
- [ ] Submitted app to App Store

---

**Ready to integrate!** 🚀

Questions? Contact API team at: [email/slack channel]
