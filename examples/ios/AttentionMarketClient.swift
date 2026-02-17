//
//  AttentionMarketClient.swift
//  AttentionMarket SDK for iOS
//
//  Drop this file into your Xcode project. No dependencies required.
//  Get API keys at https://api.attentionmarket.ai
//

import Foundation

// MARK: - Models

struct AttentionMarketAd: Codable {
    let unitId: String
    let suggestion: Suggestion
    let tracking: Tracking

    struct Suggestion: Codable {
        let title: String
        let body: String
        let cta: String
        let trackingUrl: String   // Use this for clicks — tracks automatically + redirects
        let actionUrl: String     // Direct URL (display only, no tracking)

        enum CodingKeys: String, CodingKey {
            case title, body, cta
            case trackingUrl = "tracking_url"
            case actionUrl = "action_url"
        }
    }

    struct Tracking: Codable {
        let token: String
        let impressionUrl: String

        enum CodingKeys: String, CodingKey {
            case token
            case impressionUrl = "impression_url"
        }
    }

    enum CodingKeys: String, CodingKey {
        case unitId = "unit_id"
        case suggestion, tracking
    }
}

private struct AttentionMarketResponse: Codable {
    let status: String
    let units: [AttentionMarketAd]
}

// MARK: - Client

class AttentionMarketClient {
    private let apiKey: String
    private let baseURL = "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1"

    init(apiKey: String) {
        self.apiKey = apiKey
    }

    /// Get a relevant ad for a user message.
    /// Returns nil if no matching ad is available (normal — handle gracefully).
    func getAd(for userMessage: String) async -> AttentionMarketAd? {
        guard let url = URL(string: "\(baseURL)/decide") else { return nil }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "X-AM-API-Key")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = ["context": userMessage, "platform": "ios"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200 else { return nil }

            let decoded = try JSONDecoder().decode(AttentionMarketResponse.self, from: data)
            return decoded.status == "filled" ? decoded.units.first : nil
        } catch {
            return nil
        }
    }
}

// MARK: - Usage Example
/*

// 1. Initialize once (AppDelegate, ViewModel, or wherever you init services)
let adsClient = AttentionMarketClient(apiKey: "am_live_YOUR_KEY")

// 2. After your AI responds to the user, check for a relevant ad
if let ad = await adsClient.getAd(for: userMessage) {

    // 3. Show ad in your chat UI
    showAdBanner(
        title: ad.suggestion.title,      // "Get 20% off car insurance"
        body: ad.suggestion.body,        // "Compare quotes in minutes"
        cta: ad.suggestion.cta           // "Get a Quote"
    )

    // 4. When user taps, open tracking URL (this is how you get paid)
    if let url = URL(string: ad.suggestion.trackingUrl) {
        UIApplication.shared.open(url)
    }
}

// That's it. You earn $5–$150 when the user clicks.

*/
