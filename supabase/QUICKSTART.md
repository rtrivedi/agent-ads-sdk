# 🚀 Quick Start: iOS App with Supabase Edge Functions

Follow these steps to get ads working in your iOS app in **under 10 minutes**.

---

## ✅ Prerequisites

- [ ] Supabase account (free tier works)
- [ ] AttentionMarket account with API key and Agent ID
- [ ] Supabase CLI installed: `npm install -g supabase`
- [ ] Logged into Supabase CLI: `supabase login`

---

## 📝 Step-by-Step Guide

### **Step 1: Get Your Supabase Project ID**

1. Go to https://supabase.com/dashboard
2. Click on your project (or create a new one)
3. Go to **Settings** → **General**
4. Copy your **Project ID** (looks like: `abcdefghijklmnop`)

---

### **Step 2: Link This Repo to Your Supabase Project**

```bash
# Navigate to the supabase directory
cd supabase

# Link to your project (replace with your Project ID)
supabase link --project-ref YOUR_PROJECT_ID

# When prompted, use password from Supabase Dashboard
```

---

### **Step 3: Set Your AttentionMarket Credentials**

```bash
# Set your API key (get from AttentionMarket Dashboard)
supabase secrets set ATTENTIONMARKET_API_KEY=am_live_your_actual_key_here

# Set your Agent ID (get from AttentionMarket Dashboard)
supabase secrets set ATTENTIONMARKET_AGENT_ID=agt_your_actual_agent_id_here
```

**Where to find these:**
- API Key: AttentionMarket Dashboard → API Keys → Copy
- Agent ID: AttentionMarket Dashboard → Agents → Copy ID

---

### **Step 4: Deploy Edge Functions**

```bash
# Deploy all 3 functions
supabase functions deploy get-ad
supabase functions deploy track-impression
supabase functions deploy track-click

# Expected output:
# ✓ Deployed get-ad (2.1s)
# ✓ Deployed track-impression (1.8s)
# ✓ Deployed track-click (1.9s)
```

---

### **Step 5: Get Your Supabase Anon Key**

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy **anon** **public** key (looks like: `eyJhbGciOi...`)
3. You'll need this for your iOS app

---

### **Step 6: Test Your Functions**

Replace `YOUR_PROJECT_ID` and `YOUR_ANON_KEY` below:

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

# Expected response:
# {"ad":{"title":"...","body":"...","cta":"...","actionUrl":"...","disclosure":{...},"tracking":{...}}}
```

---

### **Step 7: Add Code to Your iOS App**

#### A. Add this file to your Xcode project:

**File: `AttentionMarketAPI.swift`**

```swift
import Foundation

class AttentionMarketAPI {
    // 🔧 REPLACE THESE WITH YOUR VALUES
    private let baseURL = "https://YOUR_PROJECT_ID.supabase.co/functions/v1"
    private let anonKey = "YOUR_ANON_KEY"

    func getAd(taxonomy: String, query: String? = nil) async throws -> Ad? {
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

// Models
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

#### B. Add this SwiftUI view:

**File: `AdView.swift`**

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

            // Title
            Text(ad.title)
                .font(.headline)

            // Body
            Text(ad.body)
                .font(.body)
                .foregroundColor(.secondary)

            // CTA Button
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
            // Track impression
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

// Preview
struct AdView_Previews: PreviewProvider {
    static var previews: some View {
        AdView(ad: Ad(
            title: "Professional Moving Services",
            body: "Licensed & insured movers. Free estimates.",
            cta: "Get Free Quote →",
            actionUrl: "https://example.com",
            disclosure: Ad.Disclosure(
                label: "Sponsored",
                sponsorName: "Best Movers NYC",
                explanation: "This is a paid advertisement"
            ),
            tracking: Ad.Tracking(
                requestId: "req_123",
                decisionId: "dec_456",
                unitId: "unit_789",
                token: "trk_abc"
            )
        ))
    }
}
```

#### C. Use it in your app:

```swift
import SwiftUI

struct ContentView: View {
    @State private var ad: Ad?
    let api = AttentionMarketAPI()

    var body: some View {
        VStack {
            if let ad = ad {
                AdView(ad: ad)
                    .padding()
            } else {
                ProgressView("Loading ad...")
            }
        }
        .task {
            // Fetch ad when view appears
            ad = try? await api.getAd(
                taxonomy: "local_services.movers.quote",
                query: "Find movers in Brooklyn"
            )
        }
    }
}
```

---

## ✅ Done!

Your iOS app now shows ads from AttentionMarket via Supabase Edge Functions!

---

## 🧪 Testing Checklist

- [ ] Edge Functions deployed successfully
- [ ] curl test returns an ad
- [ ] iOS app shows ad
- [ ] Impression tracked when ad appears
- [ ] Click tracked when user taps CTA
- [ ] URL opens in Safari

---

## 🐛 Troubleshooting

### "Function not found" error
```bash
# Make sure functions are deployed
supabase functions deploy
```

### "Missing environment variables" error
```bash
# Check secrets are set
supabase secrets list

# Set them if missing
supabase secrets set ATTENTIONMARKET_API_KEY=...
supabase secrets set ATTENTIONMARKET_AGENT_ID=...
```

### "No ad returned"
- Check AttentionMarket has campaigns for your taxonomy
- Verify your Agent ID is correct
- Try with mock client first: `MockAttentionMarketClient`

### CORS errors in iOS
- Make sure you're sending `Authorization: Bearer YOUR_ANON_KEY`
- CORS is already configured in the functions

---

## 📚 Next Steps

1. **Add more taxonomies** - Support different ad types
2. **Add error handling** - Show fallback content if no ad
3. **Add analytics** - Track ad performance
4. **Customize styling** - Match your app's design

---

**Questions?** Open an issue: https://github.com/rtrivedi/agent-ads-sdk/issues
