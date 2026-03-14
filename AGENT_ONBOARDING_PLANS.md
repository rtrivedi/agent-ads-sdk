# Agent Onboarding Strategy — Implementation Plans

Each section below is a **self-contained workstream** that can be handed to an independent coding agent. No cross-dependencies between workstreams unless explicitly noted.

---

## Workstream 1: MCP Server

**Goal:** Publish an AttentionMarket MCP (Model Context Protocol) server so any MCP-compatible agent (Claude Code, Cursor, etc.) can serve and monetize ads with zero SDK code.

**Output:** A new `packages/mcp-server/` directory (or top-level `mcp-server/`) containing a standalone, publishable MCP server package.

### Context

- The existing SDK lives at `/home/user/agent-ads-sdk/` and is published as `@the_ro_show/agent-ads-sdk`
- The SDK has zero external dependencies and uses native `fetch`
- Main client class: `src/client.ts` — `AttentionMarketClient`
- Key methods to expose: `decideFromContext()`, `requestOffer()`, `requestOfferFromContext()`, `getService()`, `logServiceResult()`, `sendFeedback()`, `getCategories()`
- Types: `src/types.ts` — all request/response interfaces
- Auth: requires `apiKey` (format `am_live_*` or `am_test_*`) and `agentId`

### What to Build

1. **MCP Server package** (`mcp-server/`)
   - `package.json` — name: `@the_ro_show/agent-ads-mcp`, bin entry for CLI execution
   - Depends on `@the_ro_show/agent-ads-sdk` and `@modelcontextprotocol/sdk`
   - TypeScript source compiled with tsup

2. **MCP Tools to expose** (each becomes an MCP tool):
   - `get_ad` — wraps `decideFromContext()`. Inputs: `user_message` (string, required), `conversation_history` (string[], optional), `placement` (string, optional). Returns ad creative + click_url + disclosure.
   - `get_offer` — wraps `requestOfferFromContext()`. Inputs: `placement_id` (string), `user_message` (string), `conversation_history` (string[], optional). Returns offer with click_url.
   - `get_service` — wraps `getService()`. Inputs: `task_description` (string), `context` (string, optional). Returns service endpoint + auth + transaction_id.
   - `complete_service` — wraps `logServiceResult()`. Inputs: `transaction_id` (string), `success` (boolean). Returns confirmation.
   - `send_feedback` — wraps `sendFeedback()`. Inputs: `tracking_token` (string), `user_response` (string). Returns sentiment + bonus info.
   - `browse_categories` — wraps `getCategories()`. Inputs: `search` (string, optional), `tier` (number, optional). Returns category list.

3. **Configuration via environment variables:**
   - `ATTENTION_MARKET_API_KEY` — required
   - `ATTENTION_MARKET_AGENT_ID` — required
   - `ATTENTION_MARKET_BASE_URL` — optional (defaults to production)

4. **MCP Resources to expose:**
   - `attention-market://policy` — returns current ad policy/disclosure requirements
   - `attention-market://categories` — returns full category taxonomy

5. **Entry point:** `src/index.ts` that creates MCP server, registers tools, connects via stdio transport

6. **README.md** with:
   - Install: `npx @the_ro_show/agent-ads-mcp`
   - Claude Desktop config snippet (JSON for `claude_desktop_config.json`)
   - Cursor config snippet
   - Environment variable setup
   - Example tool usage

### Implementation Notes

- Use `@modelcontextprotocol/sdk` — specifically `McpServer` from `@modelcontextprotocol/sdk/server/mcp.js` and `StdioServerTransport` from `@modelcontextprotocol/sdk/server/stdio.js`
- Use `zod` for input validation schemas (required by MCP SDK)
- Each tool should handle errors gracefully and return human-readable error messages
- The `get_ad` tool response should format the ad naturally (use `formatNatural()` from the SDK)
- Include disclosure text in every ad response (required by policy)
- Do NOT re-implement HTTP logic — import and use `AttentionMarketClient` directly

### File Structure

```
mcp-server/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── src/
│   ├── index.ts          # MCP server setup + stdio transport
│   ├── tools.ts          # Tool definitions and handlers
│   └── resources.ts      # Resource definitions
└── bin/
    └── mcp-server.js     # CLI entry (#!/usr/bin/env node)
```

### Acceptance Criteria

- [ ] `npx @the_ro_show/agent-ads-mcp` starts a working MCP server on stdio
- [ ] All 6 tools are callable from an MCP client
- [ ] Tools return properly formatted ad content with disclosure
- [ ] Errors return human-readable messages (not stack traces)
- [ ] README has copy-paste config for Claude Desktop and Cursor
- [ ] Package builds cleanly with `npm run build`
- [ ] TypeScript strict mode, no `any` types

---

## Workstream 2: LangChain Tool Integration

**Goal:** Create a LangChain-compatible tool that any LangChain/LangGraph agent can use to serve ads.

**Output:** A new `packages/langchain/` directory containing a publishable Python package.

### Context

- The SDK backend is a REST API (Supabase Edge Functions)
- Base URL: `https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1`
- Key endpoints:
  - `POST /decide` — main ad serving (see DecideRequest/DecideResponse types in `src/types.ts`)
  - `POST /event` — event tracking (impressions, conversions)
  - `POST /service-result` — service completion
  - `POST /feedback` — user feedback/sentiment
  - `POST /intenture-decide` — intent-key based offers
- Auth headers: `Authorization: Bearer {supabase_anon_key}`, `X-AM-API-Key: {api_key}`
- The Supabase anon key is: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcnV3bmJycWt2bXJsZGhwb29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MTQxMDIsImV4cCI6MjA1MjI5MDEwMn0.sOBOfjEeicphHKTH3F-s5WEyhp9YJRKnFcvCR09mhiE`

### What to Build

1. **Python package** (`packages/langchain/`)
   - `pyproject.toml` — name: `agent-ads-langchain`, deps: `langchain-core>=0.2`, `httpx`
   - Python 3.9+ compatible

2. **LangChain Tool class:**
   ```python
   class AttentionMarketTool(BaseTool):
       name = "get_relevant_ad"
       description = "Get a relevant sponsored suggestion for the user based on their message and conversation context. Returns ad content with disclosure and click URL. Use when the conversation topic aligns with potential advertiser offerings."

       # Inputs
       api_key: str
       agent_id: str
       base_url: str = "https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1"

       def _run(self, user_message: str, conversation_history: str = "") -> str:
           # Call /decide endpoint
           # Format response as natural text with disclosure
           # Return formatted ad or "No relevant ads available"
   ```

3. **LangChain Toolkit class** (optional, for advanced users):
   ```python
   class AttentionMarketToolkit(BaseToolkit):
       # Returns list of tools: get_ad, get_service, complete_service, browse_categories
   ```

4. **Direct HTTP implementation** — do NOT depend on the Node.js SDK. Use `httpx` to call the REST API directly. Replicate the request format from `src/client.ts`:
   - Build `DecideRequest` JSON matching the TypeScript interface
   - Send with proper auth headers
   - Parse response and format

5. **README.md** with:
   - `pip install agent-ads-langchain`
   - Quick start with LangChain agent
   - Example with ChatOpenAI + AgentExecutor
   - Example with LangGraph

### Implementation Notes

- Study `src/client.ts` `decideFromContext()` method (around line 200-350) to understand the request building logic — replicate in Python
- Study `src/types.ts` for `DecideRequest`, `DecideResponse`, `AdUnit` interfaces — replicate as Python dataclasses or TypedDicts
- The `/decide` endpoint expects a `DecideRequest` body with `request_id`, `agent_id`, `placement`, `opportunity` fields
- Use the utility functions in `src/utils.ts` as reference for building `Opportunity` objects
- Format ad responses to include: title, body, CTA, click_url, and disclosure label
- Handle "no_fill" responses gracefully (return "No relevant ads available")

### File Structure

```
packages/langchain/
├── pyproject.toml
├── README.md
├── src/
│   └── agent_ads_langchain/
│       ├── __init__.py
│       ├── tool.py           # AttentionMarketTool
│       ├── toolkit.py        # AttentionMarketToolkit (multi-tool)
│       ├── client.py         # HTTP client for REST API
│       └── types.py          # Python equivalents of TypeScript types
└── examples/
    ├── basic_agent.py        # Simple LangChain agent example
    └── langgraph_agent.py    # LangGraph example
```

### Acceptance Criteria

- [ ] `pip install .` works from `packages/langchain/`
- [ ] Tool works with `AgentExecutor` and returns formatted ads
- [ ] Handles no-fill responses without errors
- [ ] Disclosure text always included in output
- [ ] Works with Python 3.9+
- [ ] README has working copy-paste examples
- [ ] No dependency on the Node.js SDK

---

## Workstream 3: CrewAI Tool Integration

**Goal:** Create a CrewAI-compatible tool for ad serving in CrewAI multi-agent workflows.

**Output:** A new `packages/crewai/` directory containing a publishable Python package.

### Context

Same REST API context as Workstream 2 (LangChain). See that section for endpoint details, auth headers, and request/response formats.

### What to Build

1. **Python package** (`packages/crewai/`)
   - `pyproject.toml` — name: `agent-ads-crewai`, deps: `crewai-tools>=0.8`, `httpx`

2. **CrewAI Tool class:**
   ```python
   from crewai_tools import BaseTool

   class AttentionMarketAdTool(BaseTool):
       name: str = "Get Relevant Ad"
       description: str = "Fetches a relevant sponsored suggestion based on the current conversation context. Returns ad content with required disclosure and click URL."
       api_key: str
       agent_id: str

       def _run(self, user_message: str) -> str:
           # Call /decide endpoint via HTTP
           # Return formatted ad with disclosure
   ```

3. **HTTP client** — reuse same REST API logic as LangChain package (or factor into a shared `agent-ads-python-core` if practical, but keeping self-contained is preferred for independent deployment)

4. **README.md** with:
   - `pip install agent-ads-crewai`
   - Quick start with CrewAI Agent + Task
   - Example multi-agent crew with ad monetization

### File Structure

```
packages/crewai/
├── pyproject.toml
├── README.md
├── src/
│   └── agent_ads_crewai/
│       ├── __init__.py
│       ├── tool.py           # AttentionMarketAdTool
│       ├── client.py         # HTTP client (self-contained)
│       └── types.py          # Response types
└── examples/
    └── basic_crew.py         # CrewAI example
```

### Acceptance Criteria

- [ ] `pip install .` works
- [ ] Tool integrates with CrewAI Agent without errors
- [ ] Formatted ad responses with disclosure
- [ ] Handles no-fill gracefully
- [ ] README with working example
- [ ] Self-contained (no dependency on LangChain package)

---

## Workstream 4: Vercel AI SDK Middleware

**Goal:** Create a Vercel AI SDK middleware/provider that injects relevant ads into streaming AI responses.

**Output:** A new `packages/vercel-ai/` directory containing a publishable npm package.

### Context

- Existing SDK: `@the_ro_show/agent-ads-sdk` (npm, zero deps, Node 18+)
- Main client: `AttentionMarketClient` from `src/client.ts`
- Key method: `decideFromContext({ userMessage, conversationHistory })` returns `AdResponse | null`
- `AdResponse` contains: `title`, `body`, `cta`, `click_url`, `tracking_token`, `disclosure`
- Formatting utils: `formatNatural()` from `src/formatting.ts`

### What to Build

1. **NPM package** (`packages/vercel-ai/`)
   - `package.json` — name: `@the_ro_show/agent-ads-vercel-ai`
   - Deps: `@the_ro_show/agent-ads-sdk`, `ai` (peer dep, Vercel AI SDK)

2. **Middleware function:**
   ```typescript
   import { Middleware } from 'ai';

   export function attentionMarketMiddleware(config: {
     apiKey: string;
     agentId: string;
     placement?: string;
     position?: 'before' | 'after';  // inject ad before or after AI response
     format?: 'markdown' | 'text' | 'json';
   }): Middleware
   ```

   The middleware should:
   - Intercept `streamText` / `generateText` calls
   - Extract user message from the messages array
   - Call `decideFromContext()` with the user message + recent history
   - If ad returned, append/prepend formatted ad to the response stream
   - Include disclosure text
   - If no fill, pass through unchanged

3. **Provider wrapper** (alternative API):
   ```typescript
   export function wrapWithAds(
     model: LanguageModel,
     config: AdConfig
   ): LanguageModel
   ```

4. **README.md** with:
   - `npm install @the_ro_show/agent-ads-vercel-ai`
   - Next.js API route example
   - `streamText` example with middleware
   - Configuration options

### Implementation Notes

- Study Vercel AI SDK middleware pattern: https://ai-sdk.dev/docs/ai-sdk-core/middleware
- The middleware wraps `doGenerate` and `doStream` on the language model
- For streaming: create a `TransformStream` that appends ad content after the model finishes
- Keep it lightweight — don't buffer the full response
- Use `formatNatural()` from the SDK for consistent ad formatting

### File Structure

```
packages/vercel-ai/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
├── src/
│   ├── index.ts              # Main exports
│   ├── middleware.ts          # Middleware implementation
│   └── provider.ts           # Provider wrapper (alternative)
└── examples/
    └── nextjs-route.ts       # Next.js API route example
```

### Acceptance Criteria

- [ ] Works with `streamText()` and `generateText()` from Vercel AI SDK
- [ ] Ads injected without breaking streaming
- [ ] Disclosure always included
- [ ] No-fill = passthrough (no visible change)
- [ ] README with working Next.js example
- [ ] TypeScript strict, no `any`

---

## Workstream 5: OpenAI GPT Action / Plugin Spec

**Goal:** Create an OpenAPI spec and lightweight proxy so any GPT or OpenAI Assistant can call AttentionMarket as a tool/action.

**Output:** A deployable API proxy + OpenAPI spec in `packages/openai-action/`.

### Context

- GPT Actions require an OpenAPI 3.1 spec describing available endpoints
- The existing Supabase endpoints work but need a cleaner interface for GPT consumption
- Auth for GPT Actions is typically API key in header

### What to Build

1. **OpenAPI 3.1 spec** (`openapi.yaml`):
   - `POST /get-ad` — simplified wrapper around `/decide`
     - Input: `{ "user_message": string, "conversation_history"?: string[] }`
     - Output: `{ "ad": { "title", "body", "cta", "click_url", "disclosure" } }` or `{ "ad": null }`
   - `POST /get-service` — wrapper around `/decide` for service ads
   - `POST /complete-service` — wrapper around `/service-result`
   - `GET /categories` — wrapper around `/decide` categories
   - Auth: API key via `X-AM-API-Key` header

2. **Lightweight proxy** (optional, if Supabase endpoints can't be used directly):
   - A small Supabase Edge Function or Cloudflare Worker that:
     - Accepts simplified request format
     - Transforms to full `DecideRequest`
     - Returns simplified response
   - File: `supabase/functions/openai-proxy/index.ts`

3. **GPT Builder instructions** — markdown file with:
   - Step-by-step to add as GPT Action
   - Auth configuration (API key)
   - System prompt additions for the GPT to use the tool well
   - Testing instructions

4. **README.md** with:
   - How to create a GPT Action with this spec
   - How to use with OpenAI Assistants API function calling
   - Curl examples for testing

### File Structure

```
packages/openai-action/
├── openapi.yaml              # OpenAPI 3.1 spec
├── README.md                 # Setup instructions
├── gpt-builder-guide.md      # GPT Builder specific instructions
├── proxy/                    # Optional proxy function
│   └── index.ts              # Supabase Edge Function
└── examples/
    └── assistants-api.py     # OpenAI Assistants API example
```

### Acceptance Criteria

- [ ] OpenAPI spec validates with swagger-cli or similar
- [ ] Spec can be imported into GPT Builder
- [ ] Proxy (if built) deploys to Supabase
- [ ] Response format is GPT-friendly (clear, concise JSON)
- [ ] README covers both GPT Actions and Assistants API
- [ ] Auth works via API key header

---

## Workstream 6: 5-Minute Quickstart & Interactive Playground

**Goal:** Create a zero-friction onboarding experience: playground page + streamlined quickstart that gets developers from signup to first ad in under 5 minutes.

**Output:** Updated `README.md`, new `examples/quickstart.ts`, and a simple hosted playground concept.

### Context

- Current README is at `/home/user/agent-ads-sdk/README.md` (~200 lines)
- Current examples are in `/home/user/agent-ads-sdk/examples/`
- Static signup method: `AttentionMarketClient.signupAgent()` returns `agent_id` + `api_key`
- `decideFromContext()` is the simplest API — 1 method call to get an ad

### What to Build

1. **Streamlined quickstart script** (`examples/quickstart.ts`):
   ```typescript
   // 1. Sign up (get API key automatically)
   const { agent_id, api_key } = await AttentionMarketClient.signupAgent({
     name: "My Agent",
     developer_email: "dev@example.com"
   });

   // 2. Initialize
   const client = new AttentionMarketClient({ apiKey: api_key, agentId: agent_id });

   // 3. Get your first ad
   const ad = await client.decideFromContext({
     userMessage: "I want to start an online store"
   });

   // 4. Show to user
   console.log(`💡 ${ad.title}: ${ad.body}`);
   console.log(`👉 ${ad.click_url}`);
   console.log(`ℹ️ ${ad.disclosure}`);
   ```

2. **CLI quickstart command** (`bin/quickstart.js`):
   - Interactive script: asks for email → auto-signs up → makes test API call → prints result
   - Can be run with `npx @the_ro_show/agent-ads-sdk quickstart`
   - Shows the ad response formatted nicely in terminal

3. **Curl-based quickstart** (for non-Node developers):
   - Step 1: Curl to sign up and get API key
   - Step 2: Curl to get an ad
   - No SDK needed, pure REST

4. **Updated README.md** — restructure the top section:
   - Hero: "Monetize your AI agent in 5 minutes"
   - 3-line code snippet (the absolute minimum)
   - "Try it now" curl command
   - Then detailed docs below

5. **Playground page concept** (`examples/playground/`):
   - Single HTML file with embedded JS
   - Text input for "user message"
   - Button to fetch ad
   - Shows formatted ad response
   - Uses test API key (pre-configured)
   - Can be hosted on GitHub Pages or Vercel

### File Structure

```
examples/
├── quickstart.ts             # Annotated 3-step quickstart
├── quickstart-curl.sh        # Pure REST quickstart
└── playground/
    ├── index.html            # Self-contained playground page
    └── README.md             # How to host it
bin/
└── quickstart.js             # CLI quickstart command
```

### Acceptance Criteria

- [ ] `npx @the_ro_show/agent-ads-sdk quickstart` works end-to-end
- [ ] Curl quickstart works without Node.js installed
- [ ] Playground HTML loads and fetches ads in browser
- [ ] README top section is < 30 lines to first working code
- [ ] Time from `npm install` to seeing an ad < 5 minutes

---

## Workstream 7: Framework Starter Templates

**Goal:** Create drop-in starter templates for the most popular AI agent frameworks, so developers can clone and run immediately.

**Output:** A `starters/` directory with one subdirectory per framework.

### Context

Same SDK and REST API as above. Each starter should be a complete, runnable project.

### What to Build

One starter per framework. Each is a standalone project with its own `package.json` or `pyproject.toml`:

1. **`starters/langchain-starter/`** (Python)
   - LangChain agent with AttentionMarket tool
   - Uses ChatOpenAI or ChatAnthropic
   - `.env.example` with `ATTENTION_MARKET_API_KEY`, `OPENAI_API_KEY`
   - `main.py` — run and chat, ads appear naturally

2. **`starters/crewai-starter/`** (Python)
   - CrewAI crew with ad monetization
   - Example: "Research Agent" that includes sponsored suggestions
   - `main.py` — run crew, see ads in output

3. **`starters/vercel-ai-starter/`** (TypeScript/Next.js)
   - Next.js app with Vercel AI SDK
   - Chat interface with ads injected via middleware
   - `app/api/chat/route.ts` — streaming chat with ads

4. **`starters/openai-assistants-starter/`** (Python)
   - OpenAI Assistants API with function calling
   - AttentionMarket as a function tool
   - `main.py` — creates assistant, runs thread, shows ads

5. **`starters/anthropic-claude-starter/`** (TypeScript)
   - Claude API with tool use
   - AttentionMarket as a Claude tool
   - `main.ts` — sends message, Claude calls ad tool, shows result

Each starter needs:
- `README.md` with setup instructions (< 5 steps)
- `.env.example` with required env vars
- Single entry point file
- Works out of the box after `npm install` / `pip install` + env vars

### File Structure

```
starters/
├── langchain-starter/
│   ├── pyproject.toml
│   ├── README.md
│   ├── .env.example
│   └── main.py
├── crewai-starter/
│   ├── pyproject.toml
│   ├── README.md
│   ├── .env.example
│   └── main.py
├── vercel-ai-starter/
│   ├── package.json
│   ├── README.md
│   ├── .env.example
│   └── app/api/chat/route.ts
├── openai-assistants-starter/
│   ├── pyproject.toml
│   ├── README.md
│   ├── .env.example
│   └── main.py
└── anthropic-claude-starter/
    ├── package.json
    ├── README.md
    ├── .env.example
    └── main.ts
```

### Acceptance Criteria

- [ ] Each starter runs with `npm start` or `python main.py` after setup
- [ ] Each README has < 5 setup steps
- [ ] `.env.example` documents all required vars
- [ ] Each starter demonstrates a real ad being served
- [ ] No hard-coded API keys

---

## Workstream 8: Developer Referral & Onboarding Credits System

**Goal:** Build the backend for a referral program and onboarding credits to incentivize adoption.

**Output:** New database migration + Supabase Edge Functions for referral tracking and credit management.

### Context

- Backend: Supabase (PostgreSQL + Edge Functions)
- Existing tables: `campaigns`, `ad_units`, `click_tracking_tokens`, `quality_score_history`
- Developer auth: API key based (`am_live_*` / `am_test_*`)
- Agent signup: `POST /agent-signup` endpoint exists
- Supabase project: `peruwnbrqkvmrldhpoom`

### What to Build

1. **Database migration** (`supabase/migrations/add_referral_and_credits.sql`):
   ```sql
   -- Referral tracking
   CREATE TABLE referrals (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     referrer_agent_id UUID NOT NULL REFERENCES agents(id),
     referred_agent_id UUID NOT NULL REFERENCES agents(id),
     referral_code VARCHAR(32) NOT NULL UNIQUE,
     status VARCHAR(20) DEFAULT 'pending',  -- pending, active, expired
     revenue_share_pct DECIMAL(5,2) DEFAULT 10.00,
     revenue_share_duration_days INT DEFAULT 180,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     activated_at TIMESTAMPTZ,
     expires_at TIMESTAMPTZ
   );

   -- Onboarding credits
   CREATE TABLE onboarding_credits (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     agent_id UUID NOT NULL REFERENCES agents(id),
     credit_amount_cents INT NOT NULL DEFAULT 10000,  -- $100
     credit_remaining_cents INT NOT NULL DEFAULT 10000,
     impressions_used INT DEFAULT 0,
     impressions_limit INT DEFAULT 1000,
     status VARCHAR(20) DEFAULT 'active',  -- active, exhausted, expired
     created_at TIMESTAMPTZ DEFAULT NOW(),
     expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
   );

   -- Referral revenue tracking
   CREATE TABLE referral_earnings (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     referral_id UUID NOT NULL REFERENCES referrals(id),
     earning_event_id UUID NOT NULL,
     amount_cents INT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Referral code generation endpoint** (`supabase/functions/referral/index.ts`):
   - `POST /referral/generate` — generate unique referral code for authenticated agent
   - `GET /referral/stats` — get referral stats (count, earnings)

3. **Update agent-signup** to accept `referral_code` parameter:
   - If valid code, create referral record + auto-provision onboarding credits
   - If no code, still provision onboarding credits (everyone gets them)

4. **Credit consumption logic**:
   - Modify the `decide` function to check `onboarding_credits` table
   - If agent has active credits and impression served, decrement `credit_remaining_cents`
   - Credits supplement (not replace) normal auction revenue

5. **Referral revenue share logic**:
   - When a referred agent earns revenue, calculate 10% share
   - Insert into `referral_earnings`
   - Make available via stats endpoint

### File Structure

```
supabase/
├── migrations/
│   └── add_referral_and_credits.sql
└── functions/
    └── referral/
        └── index.ts
```

### Acceptance Criteria

- [ ] Migration runs cleanly on fresh database
- [ ] Referral codes generate and validate
- [ ] Onboarding credits auto-provision on signup
- [ ] Credits consumed on ad impressions
- [ ] Referral earnings tracked correctly
- [ ] Stats endpoint returns accurate data
- [ ] All monetary operations use atomic transactions

---

## Workstream 9: Auto-Signup & Zero-Config SDK Initialization

**Goal:** Make SDK initialization as frictionless as possible — ideally zero-config for getting started.

**Output:** Updates to `src/client.ts` and new `src/auto-signup.ts`.

### Context

- Current init requires `apiKey` and `agentId` — both require pre-registration
- Static method `AttentionMarketClient.signupAgent()` exists but must be called separately
- SDK source: `src/client.ts`, types: `src/types.ts`

### What to Build

1. **Auto-signup flow** (`src/auto-signup.ts`):
   ```typescript
   // On first use, auto-register and cache credentials
   export async function getOrCreateCredentials(config: {
     developerEmail: string;
     agentName?: string;
     cachePath?: string;  // defaults to ~/.attention-market/credentials.json
   }): Promise<{ apiKey: string; agentId: string }>
   ```
   - Check local cache file first
   - If no cached credentials, call `signupAgent()` automatically
   - Save credentials to cache
   - Return cached credentials on subsequent calls

2. **Simplified constructor overload**:
   ```typescript
   // Option A: Full config (existing)
   new AttentionMarketClient({ apiKey: '...', agentId: '...' })

   // Option B: Auto-signup (new)
   const client = await AttentionMarketClient.create({
     developerEmail: 'dev@example.com',
     agentName: 'My Bot'  // optional
   })
   ```

3. **Environment variable auto-detection**:
   - If `ATTENTION_MARKET_API_KEY` is set, use it
   - If `ATTENTION_MARKET_AGENT_ID` is set, use it
   - Constructor detects these automatically if no config provided

4. **Updated client.ts** — add `static async create()` factory method

### Implementation Notes

- Cache file: use `node:fs` and `node:path` — handle gracefully if filesystem isn't available (browser env)
- Don't break existing constructor API — this is additive
- Use `node:os` for `homedir()` to find cache path
- The `create()` method should be the recommended way for new developers

### File Structure

```
src/
├── client.ts          # Add static create() method
├── auto-signup.ts     # Credential caching + auto-signup logic
└── types.ts           # Add CreateConfig type
```

### Acceptance Criteria

- [ ] `AttentionMarketClient.create({ developerEmail: '...' })` works end-to-end
- [ ] Credentials cached locally on first run
- [ ] Subsequent calls use cached credentials (no re-signup)
- [ ] Env var detection works
- [ ] Existing constructor still works unchanged
- [ ] No filesystem errors in browser environments
- [ ] Tests for auto-signup flow

---

## Workstream 10: REST API Documentation & Curl Examples

**Goal:** Create comprehensive REST API documentation so developers in ANY language can integrate without the Node.js SDK.

**Output:** A new `docs/rest-api.md` and updated curl examples.

### Context

- All backend is Supabase Edge Functions at `https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1`
- Endpoints: `/decide`, `/event`, `/service-result`, `/feedback`, `/agent-signup`, `/intenture-decide`, `/tracking-redirect`
- Auth: `Authorization: Bearer {anon_key}` + `X-AM-API-Key: {api_key}`
- Request/response formats defined in `src/types.ts`

### What to Build

1. **REST API reference** (`docs/rest-api.md`):
   - Every endpoint with method, URL, headers, request body, response body
   - Status codes and error formats
   - Rate limit info
   - Auth explanation

2. **Curl examples for each endpoint** — complete, copy-paste ready:
   ```bash
   # Sign up
   curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/agent-signup \
     -H "Content-Type: application/json" \
     -d '{"name": "My Agent", "developer_email": "dev@example.com"}'

   # Get an ad
   curl -X POST https://peruwnbrqkvmrldhpoom.supabase.co/functions/v1/decide \
     -H "Authorization: Bearer eyJ..." \
     -H "X-AM-API-Key: am_live_..." \
     -H "Content-Type: application/json" \
     -d '{"request_id": "...", "agent_id": "...", ...}'
   ```

3. **Language-specific HTTP examples** in a `docs/examples/` folder:
   - `python-requests.py` — using `requests` library
   - `go-example.go` — using `net/http`
   - `rust-example.rs` — using `reqwest`
   - `ruby-example.rb` — using `net/http`

4. **Postman/Insomnia collection** (`docs/attention-market.postman_collection.json`):
   - All endpoints pre-configured
   - Environment variables for API key

### Implementation Notes

- Study `src/client.ts` to extract exact request formats for each endpoint
- Study `src/types.ts` for complete type definitions
- Study the Supabase Edge Functions in `supabase/functions/*/index.ts` for actual endpoint behavior
- Include the actual Supabase anon key in examples (it's a public key, safe to share)
- Document error response format: `{ "error": "message", "code": "ERROR_CODE" }`

### File Structure

```
docs/
├── rest-api.md                              # Full API reference
├── examples/
│   ├── python-requests.py
│   ├── go-example.go
│   ├── rust-example.rs
│   └── ruby-example.rb
└── attention-market.postman_collection.json
```

### Acceptance Criteria

- [ ] Every endpoint documented with request/response examples
- [ ] All curl commands work when copy-pasted (with valid API key)
- [ ] Language examples are syntactically correct and runnable
- [ ] Postman collection imports cleanly
- [ ] Error responses documented

---

## Priority Order & Dependencies

| Priority | Workstream | Effort | Impact | Dependencies |
|----------|-----------|--------|--------|--------------|
| 1 | WS1: MCP Server | 2-3 days | Highest — instant ecosystem access | None |
| 2 | WS6: Quickstart & Playground | 1-2 days | High — reduces onboarding friction | None |
| 3 | WS10: REST API Docs | 1-2 days | High — unlocks all languages | None |
| 4 | WS2: LangChain Tool | 2 days | High — largest Python agent framework | WS10 (helpful, not blocking) |
| 5 | WS4: Vercel AI Middleware | 2 days | High — largest TS web framework | None |
| 6 | WS5: OpenAI GPT Action | 1-2 days | Medium — GPT ecosystem | None |
| 7 | WS3: CrewAI Tool | 1 day | Medium — growing framework | WS2 (can share HTTP client pattern) |
| 8 | WS9: Auto-Signup | 1-2 days | Medium — reduces friction | None |
| 9 | WS7: Starter Templates | 2-3 days | Medium — complements frameworks | WS2, WS3, WS4 (use their packages) |
| 10 | WS8: Referral System | 2-3 days | Lower priority — needs agents first | None |

**Parallelization:** WS1, WS2, WS3, WS4, WS5, WS6, WS8, WS9, WS10 can all run simultaneously. WS7 should wait for WS2-WS5 to stabilize.
