# Flywheel Value — AttentionMarket Data Strategy

## What We Capture (As of 2026-02-19)

Every `/decide` call now stores in `decisions`:
- `context_embedding` — 1536-dim OpenAI vector of the user's intent
- `semantic_similarity_score` — how well the winning ad matched
- `conversation_context` — raw text (for human review)
- `match_method` — semantic vs taxonomy

## Why This Matters

The context sent to `/decide` is a slice of a real human conversation with an AI agent, at the exact moment they have a need. At scale, this corpus is a dataset no one else has:

> **Real human → AI → purchase intent chains, labeled by what ad won and whether they clicked.**

Google has search queries. We have AI conversation intent.

## Cost

- OpenAI `text-embedding-3-small`: ~$0.00002/call (already paid for matching)
- Postgres vector storage: ~6KB/row
- **Storing the embedding is essentially free — we were throwing away the work before.**

At 1M calls/month: ~$20 in embedding costs, ~6GB of vectors.

## What It Unlocks Over Time

### Now (100s of calls)
- Sanity check: are embeddings clustering around real topics?
- Verify matching quality via `semantic_similarity_score` distribution

### Early Traction (10K calls)
- See which context clusters convert best
- Tell advertisers: "carbon/sustainability queries have 0.54 avg similarity to your campaign"
- Use similarity scores to improve the `SEMANTIC_THRESHOLD` constant in `decide/index.ts`

### Growth (100K calls)
- Detect emerging niches before advertisers do
- Proactively reach out: "we're seeing high volume in X category with no competing bids"
- Developer quality scoring: rich context → better matching → higher CTR → higher quality score

### Scale (1M+ calls)
- Aggregate intent trend reports as a paid advertiser product
- "Here's what AI users are asking about in your category this week"
- Potentially fine-tune a small model on our specific intent → ad → click chain
- The data itself becomes the moat

## The Moat

Google's moat is their search index.
OpenAI's moat is their RLHF data.
**Our moat is the largest labeled dataset of real human→AI→advertiser intent chains.**

This is only valuable if we start collecting early. We are.

## Practical Queries

```sql
-- Find decisions with high match quality
SELECT decision_id, semantic_similarity_score, conversation_context
FROM decisions
WHERE semantic_similarity_score > 0.6
ORDER BY created_at DESC;

-- Cluster similar intents (pgvector)
SELECT decision_id, context_embedding <=> '[...]'::vector AS distance
FROM decisions
ORDER BY distance
LIMIT 20;

-- Avg match quality by match method
SELECT match_method, AVG(semantic_similarity_score), COUNT(*)
FROM decisions
GROUP BY match_method;
```

## Privacy Note

At scale, storing raw `conversation_context` (text) becomes a GDPR/CCPA concern. Embeddings are not personally identifiable. Before enforcing text retention at scale, add:
- A data retention policy (e.g. 90-day TTL on `conversation_context`)
- A developer opt-out flag (`store_context: false` in the request)
- Review in Terms of Service

The embedding can always be kept — the raw text should eventually be TTL'd.
