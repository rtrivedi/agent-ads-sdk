# Supabase Edge Functions for AttentionMarket SDK

This folder contains Supabase Edge Functions that securely proxy the AttentionMarket SDK for your iOS app.

## 🏢 Two-Team Setup (RECOMMENDED)

This setup allows **separate teams** to work independently:

**Team 1 (API/SDK):**
- Owns dedicated Supabase project for API
- Manages AttentionMarket credentials
- Deploys Edge Functions
- Provides API contract to Team 2

**Team 2 (iOS App):**
- Owns separate Supabase project for app
- Consumes API endpoints (URL + key only)
- No access to API infrastructure
- Focuses on app experience

**👉 See `TEAM_SETUP.md` for complete two-team setup guide**

---

## 🔐 Why Edge Functions?

Your API key must NEVER be in your iOS app. These Edge Functions:
- Run server-side (API key stays secure)
- Handle ad requests from your iOS app
- Track impressions and clicks
- Sanitize ad content before sending to iOS

## 📁 Functions

1. **get-ad** - Fetches sponsored ads from AttentionMarket
2. **track-impression** - Tracks when ads are shown
3. **track-click** - Tracks when users click ads

---

## 🚀 Setup Instructions

### Step 1: Link to Your Supabase Project

```bash
# Navigate to this directory
cd supabase

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_ID

# You can find YOUR_PROJECT_ID in Supabase Dashboard > Project Settings
```

### Step 2: Set Environment Variables

```bash
# Set your AttentionMarket credentials
supabase secrets set ATTENTIONMARKET_API_KEY=am_live_your_key_here
supabase secrets set ATTENTIONMARKET_AGENT_ID=agt_your_agent_id_here
```

**Get your credentials from:**
- API Key: AttentionMarket Dashboard > API Keys
- Agent ID: AttentionMarket Dashboard > Agents

### Step 3: Deploy Functions

```bash
# Deploy all functions
supabase functions deploy get-ad
supabase functions deploy track-impression
supabase functions deploy track-click

# Or deploy all at once
supabase functions deploy
```

### Step 4: Test Functions

```bash
# Test get-ad function
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/get-ad \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "taxonomy": "local_services.movers.quote",
    "query": "Find movers in Brooklyn",
    "userLocation": {
      "country": "US",
      "language": "en"
    }
  }'

# Test track-impression
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/track-impression \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "requestId": "req_123",
    "decisionId": "dec_456",
    "unitId": "unit_789",
    "token": "trk_abc"
  }'
```

---

## 📱 iOS App Integration

Add this Swift code to your iOS app:

### 1. Create API Client

```swift
import Foundation

class AttentionMarketAPI {
    // Replace with your Supabase project URL
    private let baseURL = "https://YOUR_PROJECT_ID.supabase.co/functions/v1"
    private let anonKey = "YOUR_ANON_KEY" // From Supabase Dashboard > Settings > API

    // Fetch ad
    func getAd(taxonomy: String, query: String?) async throws -> Ad? {
        let url = URL(string: "\(baseURL)/get-ad")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")

        let body: [String: Any] = [
            "taxonomy": taxonomy,
            "query": query ?? "",
            "userLocation": [
                "country": Locale.current.region?.identifier ?? "US",
                "language": Locale.current.language.languageCode?.identifier ?? "en"
            ]
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(AdResponse.self, from: data)

        return response.ad
    }

    // Track impression
    func trackImpression(_ tracking: Ad.Tracking) async throws {
        let url = URL(string: "\(baseURL)/track-impression")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")

        let body: [String: String] = [
            "requestId": tracking.requestId,
            "decisionId": tracking.decisionId,
            "unitId": tracking.unitId,
            "token": tracking.token
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        _ = try await URLSession.shared.data(for: request)
    }

    // Track click
    func trackClick(_ tracking: Ad.Tracking, actionUrl: String) async throws {
        let url = URL(string: "\(baseURL)/track-click")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")

        let body: [String: String] = [
            "requestId": tracking.requestId,
            "decisionId": tracking.decisionId,
            "unitId": tracking.unitId,
            "token": tracking.token,
            "actionUrl": actionUrl
        ]

        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        _ = try await URLSession.shared.data(for: request)
    }
}

// Response models
struct AdResponse: Codable {
    let ad: Ad?
}

struct Ad: Codable {
    let title: String
    let body: String
    let cta: String
    let actionUrl: String
    let disclosure: Disclosure
    let tracking: Tracking

    struct Disclosure: Codable {
        let label: String
        let sponsorName: String
        let explanation: String
    }

    struct Tracking: Codable {
        let requestId: String
        let decisionId: String
        let unitId: String
        let token: String
    }
}
```

### 2. Display Ad in SwiftUI

```swift
import SwiftUI

struct AdView: View {
    let ad: Ad
    let api = AttentionMarketAPI()

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Disclosure
            Text("[\(ad.disclosure.label)] \(ad.disclosure.sponsorName)")
                .font(.caption)
                .foregroundColor(.secondary)

            // Ad content
            Text(ad.title)
                .font(.headline)

            Text(ad.body)
                .font(.body)
                .foregroundColor(.secondary)

            // CTA button
            Button(action: {
                handleAdClick()
            }) {
                HStack {
                    Text(ad.cta)
                    Spacer()
                    Image(systemName: "arrow.right")
                }
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .onAppear {
            // Track impression when ad appears
            Task {
                try? await api.trackImpression(ad.tracking)
            }
        }
    }

    private func handleAdClick() {
        // Track click
        Task {
            try? await api.trackClick(ad.tracking, actionUrl: ad.actionUrl)
        }

        // Open URL
        if let url = URL(string: ad.actionUrl) {
            UIApplication.shared.open(url)
        }
    }
}

// Usage example
struct ContentView: View {
    @State private var ad: Ad?
    let api = AttentionMarketAPI()

    var body: some View {
        VStack {
            if let ad = ad {
                AdView(ad: ad)
            } else {
                Text("Loading ad...")
            }
        }
        .task {
            // Fetch ad on load
            ad = try? await api.getAd(
                taxonomy: "local_services.movers.quote",
                query: "Find movers in Brooklyn"
            )
        }
    }
}
```

---

## 🔧 Troubleshooting

### Error: "Function not found"
- Make sure you deployed: `supabase functions deploy`
- Check project is linked: `supabase link --project-ref YOUR_PROJECT_ID`

### Error: "Missing environment variables"
- Set secrets: `supabase secrets set ATTENTIONMARKET_API_KEY=...`
- Verify: `supabase secrets list`

### Error: "CORS issues"
- CORS is already configured in the functions
- Make sure you're sending `Authorization: Bearer YOUR_ANON_KEY` header

### Error: "No ad returned"
- Check AttentionMarket has campaigns for your taxonomy
- Test with mock client first
- Verify your agent ID is correct

---

## 📊 Monitoring

View function logs in Supabase Dashboard:
1. Go to **Edge Functions** in Supabase Dashboard
2. Click on a function name
3. View **Logs** tab

---

## 🔒 Security Checklist

- ✅ API keys stored in Supabase secrets (not in code)
- ✅ Functions validate all inputs
- ✅ Ad content is sanitized (XSS prevention)
- ✅ URLs are validated (phishing prevention)
- ✅ CORS configured for iOS app
- ✅ Functions are server-side only

---

## 📚 Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [AttentionMarket SDK Docs](https://github.com/rtrivedi/agent-ads-sdk)
- [SECURITY.md](../SECURITY.md) - Security best practices

---

**Need help?** Open an issue at https://github.com/rtrivedi/agent-ads-sdk/issues
