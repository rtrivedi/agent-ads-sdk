---
sidebar_position: 9
title: REST API Reference
---

# REST API Reference

Direct HTTP API integration for any platform or language. Use this reference when the SDK is not available for your platform.

## Base Configuration

### Endpoint
```
https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1
```

### Authentication

All requests require authentication via headers:

```http
Authorization: Bearer YOUR_API_KEY
apikey: YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

**Note:** The SDK handles authentication automatically. For direct API calls, you need both the Authorization header (with your AttentionMarket API key) and the apikey header (Supabase anon key).

### Rate Limits
- **Development (test keys)**: 100 requests/minute
- **Production (live keys)**: 1000 requests/minute
- **429 Too Many Requests** returned when exceeded

## Endpoints

### Get Contextual Promotion

Retrieve a contextually relevant promotion based on user input.

```http
POST /decide
```

#### Request Body

```json
{
  "user_message": "string",
  "conversation_history": ["string"],
  "placement": "sponsored_suggestion" | "contextual_promotion" | "related_service",
  "session_context": {
    "session_id": "string",
    "message_count": number,
    "user_timezone": "string",
    "device_type": "mobile" | "desktop" | "tablet"
  },
  "min_quality_score": 0.7,
  "min_payout": 100,
  "blocked_categories": [601, 602],
  "optimize_for": "revenue" | "relevance" | "ctr"
}
```

#### Response

```json
{
  "ad": {
    "id": "ad_abc123",
    "type": "link" | "recommendation" | "service",
    "creative": {
      "title": "Spring Insurance - Save 25%",
      "body": "Get affordable coverage for new drivers",
      "cta": "Get Quote",
      "teaser": "Interested in saving on car insurance?",
      "promo_code": "SPRING25"
    },
    "click_url": "https://track.attentionmarket.ai/c/xyz789",
    "direct_url": "https://advertiser.com/landing",
    "tracking_token": "tk_def456",
    "payout": 250,
    "currency": "USD",
    "disclosure": {
      "sponsor_name": "Spring Insurance",
      "is_sponsored": true
    },
    "relevance_score": 0.89,
    "quality_score": 0.92
  }
}
```

#### Error Responses

```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid or expired",
    "status": 401
  }
}
```

### Track Event (Click/Impression/Conversion)

Report user interactions with ads. The SDK's `trackClick()` method uses this internally.

```http
POST /event
```

#### Request Body

```json
{
  "event_id": "evt_abc123",
  "event_type": "click" | "impression" | "conversion",
  "tracking_token": "tk_def456",
  "agent_id": "agt_xyz789",
  "timestamp": "2024-02-28T10:30:00Z",
  "context": {
    "device_type": "mobile",
    "user_agent": "Mozilla/5.0...",
    "session_id": "sess_123"
  },
  "metadata": {
    "conversion_value": 2999,
    "product_id": "prod_123"
  }
}
```

#### Response

```json
{
  "status": "success",
  "event_id": "evt_abc123"
}
```

**Note:** The SDK automatically handles click tracking when you use the `click_url` field from ad responses. Only use this endpoint if implementing custom tracking.

### Get Service (Agent-to-Agent)

Request a specialized AI service. **Note:** This uses the `/decide` endpoint with special parameters to filter for service ads only.

```http
POST /decide
```

#### Request Body (for Service Ads)

```json
{
  "request_id": "req_abc123",
  "agent_id": "agt_xyz789",
  "placement": {
    "type": "sponsored_suggestion",
    "surface": "service_request"
  },
  "opportunity": {
    "intent": {
      "taxonomy": "services.agent_to_agent",
      "query": "Translate this document to Spanish"
    },
    "constraints": {
      "max_units": 1,
      "allowed_unit_types": ["sponsored_suggestion"]
    }
  },
  "context": "Need Spanish translation for technical document",
  "user_intent": "Translate this document to Spanish"
}
```

#### Response (Service Ad)

```json
{
  "units": [{
    "ad_type": "service",
    "transaction_id": "txn_mno345",
    "suggestion": {
      "service_endpoint": "https://api.translator.ai/v1/translate",
      "service_auth": "Bearer svc_token_xyz",
      "service_description": "Professional translation service"
    },
    "payout": 300,
    "disclosure": {
      "sponsor_name": "TranslateAI Pro"
    }
  }]
}
```

### Report Service Result

Report the outcome of a service call.

```http
POST /service-result
```

#### Request Body

```json
{
  "transaction_id": "txn_mno345",
  "success": true,
  "response_time_ms": 1234,
  "result_quality": 5,
  "metadata": {
    "words_processed": 500,
    "accuracy_score": 0.98
  }
}
```

## Platform-Specific Examples

### Python

```python
import requests
import os

class AttentionMarketClient:
    def __init__(self, api_key, agent_id, supabase_anon_key):
        self.api_key = api_key
        self.agent_id = agent_id
        self.supabase_anon_key = supabase_anon_key
        self.base_url = "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1"

    def get_ad(self, user_message, conversation_history=None):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "apikey": self.supabase_anon_key,
            "Content-Type": "application/json"
        }

        payload = {
            "user_message": user_message,
            "conversation_history": conversation_history or [],
            "placement": "sponsored_suggestion"
        }

        response = requests.post(
            f"{self.base_url}/decide",
            json=payload,
            headers=headers
        )

        if response.status_code == 200:
            return response.json().get("ad")
        return None

# Usage
client = AttentionMarketClient(
    api_key=os.getenv("AM_API_KEY"),
    agent_id=os.getenv("AM_AGENT_ID")
)

ad = client.get_ad("I need car insurance")
if ad:
    print(f"{ad['creative']['title']} - {ad['creative']['body']}")
    print(f"Learn more: {ad['click_url']}")
```

### Swift (iOS)

```swift
import Foundation

class AttentionMarketClient {
    private let apiKey: String
    private let agentId: String
    private let supabaseAnonKey: String
    private let baseURL = "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1"

    init(apiKey: String, agentId: String, supabaseAnonKey: String) {
        self.apiKey = apiKey
        self.agentId = agentId
        self.supabaseAnonKey = supabaseAnonKey
    }

    func getAd(userMessage: String, conversationHistory: [String]? = nil) async throws -> Ad? {
        let url = URL(string: "\(baseURL)/decide")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue(supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = DecideRequest(
            userMessage: userMessage,
            conversationHistory: conversationHistory ?? [],
            placement: "sponsored_suggestion"
        )

        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            return nil
        }

        let result = try JSONDecoder().decode(DecideResponse.self, from: data)
        return result.ad
    }
}

// Data Models
struct DecideRequest: Codable {
    let userMessage: String
    let conversationHistory: [String]
    let placement: String

    enum CodingKeys: String, CodingKey {
        case userMessage = "user_message"
        case conversationHistory = "conversation_history"
        case placement
    }
}

struct DecideResponse: Codable {
    let ad: Ad?
}

struct Ad: Codable {
    let id: String
    let creative: Creative
    let clickUrl: String
    let payout: Int

    struct Creative: Codable {
        let title: String
        let body: String
        let cta: String
    }

    enum CodingKeys: String, CodingKey {
        case id, creative, payout
        case clickUrl = "click_url"
    }
}
```

### Go

```go
package attentionmarket

import (
    "bytes"
    "encoding/json"
    "net/http"
    "os"
)

type Client struct {
    APIKey  string
    AgentID string
    BaseURL string
}

func NewClient() *Client {
    return &Client{
        APIKey:  os.Getenv("AM_API_KEY"),
        AgentID: os.Getenv("AM_AGENT_ID"),
        BaseURL: "https://api.attentionmarket.ai/v1",
    }
}

func (c *Client) GetAd(userMessage string, history []string) (*Ad, error) {
    payload := map[string]interface{}{
        "user_message":         userMessage,
        "conversation_history": history,
        "placement":           "sponsored_suggestion",
    }

    jsonData, err := json.Marshal(payload)
    if err != nil {
        return nil, err
    }

    req, err := http.NewRequest("POST", c.BaseURL+"/decide", bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, err
    }

    req.Header.Set("X-API-Key", c.APIKey)
    req.Header.Set("X-Agent-ID", c.AgentID)
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result struct {
        Ad *Ad `json:"ad"`
    }

    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return result.Ad, nil
}

type Ad struct {
    ID          string   `json:"id"`
    Creative    Creative `json:"creative"`
    ClickURL    string   `json:"click_url"`
    Payout      int      `json:"payout"`
}

type Creative struct {
    Title string `json:"title"`
    Body  string `json:"body"`
    CTA   string `json:"cta"`
}
```

### cURL

```bash
# Get a contextual ad
curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "YOUR_AGENT_ID",
    "placement": {
      "type": "sponsored_suggestion"
    },
    "opportunity": {
      "intent": {
        "query": "I need car insurance"
      }
    },
    "context": "I need car insurance",
    "user_intent": "I need car insurance"
  }'

# Track a click event
curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/event \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "click",
    "tracking_token": "tk_def456",
    "agent_id": "YOUR_AGENT_ID"
  }'
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_API_KEY` | 401 | API key is missing, invalid, or expired |
| `INVALID_AGENT_ID` | 401 | Agent ID is missing or invalid |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests, slow down |
| `INVALID_REQUEST` | 400 | Request body is malformed or missing required fields |
| `NO_ADS_AVAILABLE` | 204 | No relevant ads match the context |
| `INTERNAL_ERROR` | 500 | Server error, try again later |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Best Practices

### Contextual Placement Rules

**When to request ads:**
- After providing value (answered user's question)
- After 3+ message exchanges
- When commercial intent is detected
- During natural conversation breaks

**When NOT to request ads:**
- During onboarding/first interaction
- After error messages
- Within 5 messages of previous ad
- During sensitive conversations

### Performance Optimization

1. **Cache ad responses** for 60 seconds to reduce API calls
2. **Batch conversation history** to last 10 messages max
3. **Use connection pooling** for HTTP clients
4. **Implement exponential backoff** for retries

### Security

- **Never expose API keys** in client-side code
- **Use environment variables** for credentials
- **Implement request signing** for production apps
- **Validate click URLs** before redirecting users

## SDK vs API

| Feature | SDK | REST API |
|---------|-----|----------|
| **Authentication** | Automatic | Manual headers |
| **Retry logic** | Built-in | Implement yourself |
| **Type safety** | TypeScript types | Generate from OpenAPI |
| **Click tracking** | Automatic | Manual implementation |
| **Updates** | NPM updates | API versioning |

Choose the SDK when available for your platform, use the REST API for everything else.

## Migration Guide

### From SDK to API

```javascript
// SDK (before)
const ad = await client.decideFromContext({
  userMessage: "I need insurance"
});

// REST API (after)
const response = await fetch('https://api.attentionmarket.ai/v1/decide', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'X-Agent-ID': agentId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_message: "I need insurance",
    placement: "sponsored_suggestion"
  })
});
const { ad } = await response.json();
```

## Support

- **API Status**: [status.attentionmarket.ai](https://status.attentionmarket.ai)
- **OpenAPI Spec**: [Download OpenAPI 3.0 spec](https://api.attentionmarket.ai/openapi.yaml)
- **Postman Collection**: [Import to Postman](https://api.attentionmarket.ai/postman.json)
- **Discord**: [Join our developer community](https://discord.gg/attentionmarket)