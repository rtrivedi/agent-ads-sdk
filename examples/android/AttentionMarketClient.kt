/**
 * AttentionMarketClient.kt
 * AttentionMarket SDK for Android
 *
 * Drop this file into your Android project. No dependencies required beyond OkHttp
 * (already included in most Android projects).
 * Get API keys at https://api.attentionmarket.ai
 */

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

data class AttentionMarketAd(
    val unitId: String,
    val title: String,
    val body: String,
    val cta: String,
    val trackingUrl: String,  // Use this for clicks — tracks automatically + redirects
    val actionUrl: String     // Direct URL (display only, no tracking)
)

class AttentionMarketClient(private val apiKey: String) {

    private val client = OkHttpClient()
    private val baseUrl = "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1"

    /**
     * Get a relevant ad for a user message.
     * Returns null if no matching ad is available (normal — handle gracefully).
     */
    suspend fun getAd(context: String): AttentionMarketAd? = withContext(Dispatchers.IO) {
        try {
            val body = JSONObject().apply {
                put("context", context)
                put("platform", "android")
            }.toString()

            val request = Request.Builder()
                .url("$baseUrl/decide")
                .post(body.toRequestBody("application/json".toMediaType()))
                .addHeader("X-AM-API-Key", apiKey)
                .build()

            val response = client.newCall(request).execute()
            if (!response.isSuccessful) return@withContext null

            val json = JSONObject(response.body?.string() ?: return@withContext null)
            if (json.getString("status") != "filled") return@withContext null

            val units = json.getJSONArray("units")
            if (units.length() == 0) return@withContext null

            val unit = units.getJSONObject(0)
            val suggestion = unit.getJSONObject("suggestion")

            AttentionMarketAd(
                unitId = unit.getString("unit_id"),
                title = suggestion.getString("title"),
                body = suggestion.getString("body"),
                cta = suggestion.getString("cta"),
                trackingUrl = suggestion.getString("tracking_url"),
                actionUrl = suggestion.getString("action_url")
            )
        } catch (e: Exception) {
            null
        }
    }
}

// Usage example:
//
// val adsClient = AttentionMarketClient(apiKey = "am_live_YOUR_KEY")
//
// viewModelScope.launch {
//     val ad = adsClient.getAd(context = userMessage)
//     ad?.let {
//         showAdBanner(title = it.title, body = it.body, cta = it.cta)
//         // When user taps, open tracking URL (this is how you get paid):
//         startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(it.trackingUrl)))
//     }
// }
