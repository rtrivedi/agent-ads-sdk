-- Create a test agent with known API keys for testing

INSERT INTO agents (
  agent_id,
  owner_email,
  agent_name,
  api_key_test,
  api_key_live,
  environment,
  status
)
VALUES (
  'agent_test_12345',
  'test@example.com',
  'Test Agent for Multi-Ad Testing',
  'am_test_KmFjY2Vzc1RvIHRoZSBBdHRlbnRpb25NYXJrZXQgUGxhdGZvcm06IGRlc2lnbmVkIGZvciBhZ2VudHMsIG5vdCBodW1hbnMu',
  'am_live_test_key_placeholder',
  'test',
  'active'
)
ON CONFLICT (agent_id) DO UPDATE SET
  api_key_test = EXCLUDED.api_key_test,
  status = EXCLUDED.status;

SELECT '✅ Test agent created with agent_id: agent_test_12345' AS result;
