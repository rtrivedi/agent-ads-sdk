#!/bin/bash
# Test multi-ad response with curl

curl -X POST 'https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjcwMDYsImV4cCI6MjA4NTU0MzAwNn0.FMCjeunas8ICKm9W9bo2hZwyrBttzTcJbplbAyl4XhU' \
  -H 'X-AM-API-Key: am_test_KmFjY2Vzc1RvIHRoZSBBdHRlbnRpb25NYXJrZXQgUGxhdGZvcm06IGRlc2lnbmVkIGZvciBhZ2VudHMsIG5vdCBodW1hbnMu' \
  -d '{
    "request_id": "req_test_multi_123",
    "agent_id": "agent_test_12345",
    "placement": {
      "type": "sponsored_suggestion",
      "surface": "chat_response"
    },
    "opportunity": {
      "intent": {
        "taxonomy": "shopping.ecommerce.platform"
      },
      "context": {
        "country": "US",
        "language": "en",
        "platform": "web"
      },
      "constraints": {
        "max_units": 3,
        "allowed_unit_types": ["sponsored_suggestion"]
      },
      "privacy": {
        "data_policy": "coarse_only"
      }
    }
  }' | jq '.'
