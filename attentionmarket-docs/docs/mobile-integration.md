---
sidebar_position: 10
title: Mobile Integration Guide
---

# Mobile Integration Guide

Complete guide for integrating AttentionMarket into iOS and Android applications. Native SDKs coming Q2 2024 - use our REST API until then.

## iOS Integration (Swift)

### Installation

Create a Swift package or add these files to your project:

```swift title="AttentionMarketClient.swift"
import Foundation

class AttentionMarketClient {
    private let apiKey: String
    private let agentId: String
    private let supabaseAnonKey: String
    private let baseURL = "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1"
    private let session: URLSession

    init(apiKey: String, agentId: String, supabaseAnonKey: String) {
        self.apiKey = apiKey
        self.agentId = agentId
        self.supabaseAnonKey = supabaseAnonKey

        // Configure session with caching
        let config = URLSessionConfiguration.default
        config.requestCachePolicy = .returnCacheDataElseLoad
        config.timeoutIntervalForRequest = 10
        self.session = URLSession(configuration: config)
    }

    func getAd(
        userMessage: String,
        conversationHistory: [String]? = nil,
        placement: String = "sponsored_suggestion"
    ) async throws -> AttentionMarketAd? {
        let url = URL(string: "\(baseURL)/decide")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = [
            "user_message": userMessage,
            "conversation_history": conversationHistory ?? [],
            "placement": placement,
            "session_context": [
                "device_type": "mobile",
                "platform": "ios"
            ]
        ] as [String: Any]

        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AttentionMarketError.invalidResponse
        }

        if httpResponse.statusCode == 204 {
            return nil // No ads available
        }

        guard httpResponse.statusCode == 200 else {
            throw AttentionMarketError.httpError(httpResponse.statusCode)
        }

        let decoder = JSONDecoder()
        let result = try decoder.decode(DecideResponse.self, from: data)
        return result.ad
    }

    func trackClick(trackingToken: String) async throws {
        let url = URL(string: "\(baseURL)/track/click")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "X-API-Key")
        request.setValue(agentId, forHTTPHeaderField: "X-Agent-ID")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = ["tracking_token": trackingToken]
        request.httpBody = try JSONEncoder().encode(payload)

        let (_, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw AttentionMarketError.trackingFailed
        }
    }
}

// MARK: - Data Models

struct AttentionMarketAd: Codable {
    let id: String
    let type: String
    let creative: Creative
    let clickUrl: String
    let directUrl: String
    let trackingToken: String
    let payout: Int
    let disclosure: Disclosure

    struct Creative: Codable {
        let title: String
        let body: String
        let cta: String
        let teaser: String?
        let promoCode: String?

        enum CodingKeys: String, CodingKey {
            case title, body, cta, teaser
            case promoCode = "promo_code"
        }
    }

    struct Disclosure: Codable {
        let sponsorName: String
        let isSponsored: Bool

        enum CodingKeys: String, CodingKey {
            case sponsorName = "sponsor_name"
            case isSponsored = "is_sponsored"
        }
    }

    enum CodingKeys: String, CodingKey {
        case id, type, creative, payout, disclosure
        case clickUrl = "click_url"
        case directUrl = "direct_url"
        case trackingToken = "tracking_token"
    }
}

struct DecideResponse: Codable {
    let ad: AttentionMarketAd?
}

enum AttentionMarketError: Error {
    case invalidResponse
    case httpError(Int)
    case trackingFailed
    case noAdsAvailable
}
```

### SwiftUI Ad Component

```swift title="SponsoredContentView.swift"
import SwiftUI
import SafariServices

struct SponsoredContentView: View {
    let ad: AttentionMarketAd
    @State private var showingSafari = false
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Sponsored label
            HStack {
                Image(systemName: "megaphone.fill")
                    .foregroundColor(.secondary)
                    .font(.caption)
                Text("Sponsored")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text(ad.disclosure.sponsorName)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            // Content
            VStack(alignment: .leading, spacing: 8) {
                Text(ad.creative.title)
                    .font(.headline)
                    .foregroundColor(.primary)

                Text(ad.creative.body)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(3)

                // CTA Button
                Button(action: handleClick) {
                    HStack {
                        Text(ad.creative.cta)
                            .font(.callout)
                            .fontWeight(.medium)
                        Image(systemName: "arrow.right.circle.fill")
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(colorScheme == .dark ? Color.gray.opacity(0.1) : Color.gray.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
        )
        .sheet(isPresented: $showingSafari) {
            SafariView(url: URL(string: ad.clickUrl)!)
        }
    }

    private func handleClick() {
        // Track click analytics
        Task {
            try? await AttentionMarketClient.shared.trackClick(
                trackingToken: ad.trackingToken
            )
        }

        // Open in Safari
        showingSafari = true
    }
}

// Safari View Controller wrapper
struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        return SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}
```

### UIKit Ad Component

```swift title="SponsoredContentViewController.swift"
import UIKit
import SafariServices

class SponsoredContentView: UIView {
    private let ad: AttentionMarketAd
    private weak var parentViewController: UIViewController?

    init(ad: AttentionMarketAd, parentViewController: UIViewController) {
        self.ad = ad
        self.parentViewController = parentViewController
        super.init(frame: .zero)
        setupView()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupView() {
        // Container setup
        backgroundColor = UIColor.systemGray6
        layer.cornerRadius = 12
        layer.borderWidth = 1
        layer.borderColor = UIColor.systemGray4.cgColor

        // Stack view for content
        let stackView = UIStackView()
        stackView.axis = .vertical
        stackView.spacing = 12
        stackView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stackView)

        // Sponsored label
        let sponsoredLabel = UILabel()
        sponsoredLabel.text = "Sponsored by \(ad.disclosure.sponsorName)"
        sponsoredLabel.font = .preferredFont(forTextStyle: .caption1)
        sponsoredLabel.textColor = .secondaryLabel
        stackView.addArrangedSubview(sponsoredLabel)

        // Title
        let titleLabel = UILabel()
        titleLabel.text = ad.creative.title
        titleLabel.font = .preferredFont(forTextStyle: .headline)
        titleLabel.numberOfLines = 2
        stackView.addArrangedSubview(titleLabel)

        // Body
        let bodyLabel = UILabel()
        bodyLabel.text = ad.creative.body
        bodyLabel.font = .preferredFont(forTextStyle: .subheadline)
        bodyLabel.textColor = .secondaryLabel
        bodyLabel.numberOfLines = 3
        stackView.addArrangedSubview(bodyLabel)

        // CTA Button
        let ctaButton = UIButton(type: .system)
        ctaButton.setTitle(ad.creative.cta, for: .normal)
        ctaButton.titleLabel?.font = .preferredFont(forTextStyle: .callout)
        ctaButton.backgroundColor = .systemBlue
        ctaButton.setTitleColor(.white, for: .normal)
        ctaButton.layer.cornerRadius = 8
        ctaButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 16, bottom: 8, right: 16)
        ctaButton.addTarget(self, action: #selector(handleClick), for: .touchUpInside)
        stackView.addArrangedSubview(ctaButton)

        // Constraints
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: topAnchor, constant: 16),
            stackView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            stackView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
            stackView.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -16)
        ])
    }

    @objc private func handleClick() {
        // Track click
        Task {
            try? await AttentionMarketClient.shared.trackClick(
                trackingToken: ad.trackingToken
            )
        }

        // Open in Safari
        if let url = URL(string: ad.clickUrl) {
            let safari = SFSafariViewController(url: url)
            parentViewController?.present(safari, animated: true)
        }
    }
}
```

### Integration in Chat View

```swift title="ChatViewController.swift"
class ChatViewController: UIViewController {
    private let client = AttentionMarketClient(
        apiKey: ProcessInfo.processInfo.environment["AM_API_KEY"] ?? "",
        agentId: ProcessInfo.processInfo.environment["AM_AGENT_ID"] ?? ""
    )

    private var messageHistory: [String] = []
    private var messageCount = 0
    private var lastAdShownAt = 0

    func handleUserMessage(_ message: String) {
        messageCount += 1
        messageHistory.append(message)

        // Generate AI response
        let aiResponse = generateAIResponse(for: message)
        displayMessage(aiResponse, isUser: false)

        // Check if we should show an ad
        if shouldShowAd() {
            Task {
                await showContextualAd(for: message)
            }
        }
    }

    private func shouldShowAd() -> Bool {
        // Placement rules
        let minMessagesBetweenAds = 5
        let minMessagesBeforeFirstAd = 3

        guard messageCount >= minMessagesBeforeFirstAd else { return false }
        guard messageCount - lastAdShownAt >= minMessagesBetweenAds else { return false }

        return true
    }

    @MainActor
    private func showContextualAd(for message: String) async {
        do {
            // Get the last 10 messages for context
            let recentHistory = Array(messageHistory.suffix(10))

            let ad = try await client.getAd(
                userMessage: message,
                conversationHistory: recentHistory,
                placement: "sponsored_suggestion"
            )

            if let ad = ad {
                // Create and display ad view
                let adView = SponsoredContentView(ad: ad, parentViewController: self)
                chatStackView.addArrangedSubview(adView)

                // Update tracking
                lastAdShownAt = messageCount

                // Animate appearance
                adView.alpha = 0
                UIView.animate(withDuration: 0.3) {
                    adView.alpha = 1
                }
            }
        } catch {
            print("Failed to load ad: \(error)")
            // Continue without ad - don't disrupt user experience
        }
    }
}
```

## Android Integration (Kotlin)

### Installation

Add to your module's `build.gradle`:

```kotlin title="AttentionMarketClient.kt"
import kotlinx.coroutines.*
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class AttentionMarketClient(
    private val apiKey: String,
    private val agentId: String,
    private val supabaseAnonKey: String
) {
    private val baseUrl = "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1"
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val json = "application/json".toMediaType()

    suspend fun getAd(
        userMessage: String,
        conversationHistory: List<String>? = null,
        placement: String = "sponsored_suggestion"
    ): AttentionMarketAd? = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("user_message", userMessage)
            put("conversation_history", JSONArray(conversationHistory ?: emptyList()))
            put("placement", placement)
            put("session_context", JSONObject().apply {
                put("device_type", "mobile")
                put("platform", "android")
            })
        }

        val request = Request.Builder()
            .url("$baseUrl/decide")
            .post(payload.toString().toRequestBody(json))
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("apikey", supabaseAnonKey)
            .addHeader("Content-Type", "application/json")
            .build()

        try {
            client.newCall(request).execute().use { response ->
                when (response.code) {
                    200 -> {
                        val body = response.body?.string() ?: return@withContext null
                        parseAdResponse(body)
                    }
                    204 -> null // No ads available
                    else -> throw IOException("HTTP ${response.code}")
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    suspend fun trackClick(trackingToken: String) = withContext(Dispatchers.IO) {
        val payload = JSONObject().apply {
            put("tracking_token", trackingToken)
        }

        val request = Request.Builder()
            .url("$baseUrl/track/click")
            .post(payload.toString().toRequestBody(json))
            .addHeader("X-API-Key", apiKey)
            .addHeader("X-Agent-ID", agentId)
            .build()

        try {
            client.newCall(request).execute().close()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun parseAdResponse(json: String): AttentionMarketAd? {
        return try {
            val response = JSONObject(json)
            val adJson = response.optJSONObject("ad") ?: return null

            AttentionMarketAd(
                id = adJson.getString("id"),
                type = adJson.getString("type"),
                creative = AttentionMarketAd.Creative(
                    title = adJson.getJSONObject("creative").getString("title"),
                    body = adJson.getJSONObject("creative").getString("body"),
                    cta = adJson.getJSONObject("creative").getString("cta"),
                    teaser = adJson.getJSONObject("creative").optString("teaser"),
                    promoCode = adJson.getJSONObject("creative").optString("promo_code")
                ),
                clickUrl = adJson.getString("click_url"),
                directUrl = adJson.getString("direct_url"),
                trackingToken = adJson.getString("tracking_token"),
                payout = adJson.getInt("payout"),
                disclosure = AttentionMarketAd.Disclosure(
                    sponsorName = adJson.getJSONObject("disclosure").getString("sponsor_name"),
                    isSponsored = adJson.getJSONObject("disclosure").getBoolean("is_sponsored")
                )
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

// Data Models
data class AttentionMarketAd(
    val id: String,
    val type: String,
    val creative: Creative,
    val clickUrl: String,
    val directUrl: String,
    val trackingToken: String,
    val payout: Int,
    val disclosure: Disclosure
) {
    data class Creative(
        val title: String,
        val body: String,
        val cta: String,
        val teaser: String? = null,
        val promoCode: String? = null
    )

    data class Disclosure(
        val sponsorName: String,
        val isSponsored: Boolean
    )
}
```

### Jetpack Compose Ad Component

```kotlin title="SponsoredContent.kt"
@Composable
fun SponsoredContent(
    ad: AttentionMarketAd,
    onAdClick: (AttentionMarketAd) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Sponsored label
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Campaign,
                        contentDescription = "Sponsored",
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Sponsored",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = ad.disclosure.sponsorName,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Title
            Text(
                text = ad.creative.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Body
            Text(
                text = ad.creative.body,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(12.dp))

            // CTA Button
            Button(
                onClick = { onAdClick(ad) },
                modifier = Modifier.align(Alignment.End),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            ) {
                Text(text = ad.creative.cta)
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
```

## Contextual Placement Strategy

### Smart Placement Rules

```kotlin
class AdPlacementManager {
    private var messageCount = 0
    private var lastAdShownAt = 0
    private var sessionStartTime = System.currentTimeMillis()

    fun shouldShowAd(
        userMessage: String,
        aiResponse: String
    ): Boolean {
        messageCount++

        // Rule 1: Don't show ads too early
        if (messageCount < MIN_MESSAGES_BEFORE_FIRST_AD) return false

        // Rule 2: Space out ads appropriately
        if (messageCount - lastAdShownAt < MIN_MESSAGES_BETWEEN_ADS) return false

        // Rule 3: Don't show during onboarding (first 30 seconds)
        if (System.currentTimeMillis() - sessionStartTime < 30000) return false

        // Rule 4: Check for commercial intent
        val hasCommercialIntent = detectCommercialIntent(userMessage)

        // Rule 5: Good placement opportunity (after providing value)
        val providedValue = aiResponse.length > 100 ||
                           aiResponse.contains("Here") ||
                           aiResponse.contains("I found")

        return hasCommercialIntent || (providedValue && Random.nextFloat() < 0.3f)
    }

    private fun detectCommercialIntent(message: String): Boolean {
        val commercialKeywords = listOf(
            "buy", "purchase", "need", "looking for", "recommend",
            "best", "compare", "price", "cost", "cheap", "affordable"
        )

        return commercialKeywords.any {
            message.lowercase().contains(it)
        }
    }

    fun recordAdShown() {
        lastAdShownAt = messageCount
    }

    companion object {
        const val MIN_MESSAGES_BEFORE_FIRST_AD = 3
        const val MIN_MESSAGES_BETWEEN_ADS = 5
    }
}
```

## Performance & Optimization

### Caching Strategy

```swift
// iOS - URLSession caching
let config = URLSessionConfiguration.default
config.requestCachePolicy = .returnCacheDataElseLoad
config.urlCache = URLCache(
    memoryCapacity: 10 * 1024 * 1024,  // 10 MB
    diskCapacity: 50 * 1024 * 1024,    // 50 MB
    diskPath: "attentionmarket_cache"
)
```

```kotlin
// Android - OkHttp caching
val cacheSize = 10L * 1024L * 1024L // 10 MB
val cache = Cache(context.cacheDir, cacheSize)

val client = OkHttpClient.Builder()
    .cache(cache)
    .addInterceptor { chain ->
        val request = chain.request().newBuilder()
            .header("Cache-Control", "max-age=60") // Cache for 60 seconds
            .build()
        chain.proceed(request)
    }
    .build()
```

### Battery & Data Optimization

- **Batch requests** when multiple ads needed
- **Cache responses** for 60 seconds minimum
- **Respect network conditions** - reduce requests on cellular
- **Background prefetch** during Wi-Fi for better UX

## App Store & Play Store Compliance

### Required Disclosures

1. **Privacy Policy** must mention:
   - Contextual advertising
   - No user tracking
   - Data used only for ad selection

2. **App Store Review Notes**:
   - Ads are clearly labeled as "Sponsored"
   - No incentivized clicks
   - Compliant with Apple's advertising guidelines

3. **Google Play Requirements**:
   - Declare ad ID usage (not required for contextual)
   - Family-safe ads if in family category

## Testing

### Test Credentials

```yaml
# Use these for development
API_KEY: am_test_abc123xyz
AGENT_ID: agt_test_demo
```

### Test Scenarios

```swift
// iOS Testing
#if DEBUG
class MockAttentionMarketClient: AttentionMarketClient {
    override func getAd(...) async throws -> AttentionMarketAd? {
        // Return mock ad for testing
        return AttentionMarketAd(
            id: "test_ad",
            creative: .init(
                title: "Test Product",
                body: "Great for testing",
                cta: "Learn More"
            ),
            // ... other fields
        )
    }
}
#endif
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| No ads returned | Normal - no relevant campaigns. Implement graceful fallback |
| 401 Unauthorized | Check API key and Agent ID headers |
| Network timeouts | Implement retry with exponential backoff |
| UI not updating | Ensure UI updates on main thread |

## Support

- **Mobile SDK Beta**: Join waitlist at [attentionmarket.ai/mobile-sdk](https://attentionmarket.ai/mobile-sdk)
- **Discord**: [Mobile developers channel](https://discord.gg/attentionmarket)
- **Sample Apps**: [GitHub - iOS](https://github.com/attentionmarket/ios-example) | [Android](https://github.com/attentionmarket/android-example)