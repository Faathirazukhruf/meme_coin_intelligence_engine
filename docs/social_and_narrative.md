# Social & Narrative Enrichment Engine (Phase 9)

## Overview
Phase 9 implements the **Social & Narrative Intelligence Layer** (PRD Section 11, 16 & 22). Adhering strictly to the **MATH FIRST → AI SECOND** philosophy:
- Social metrics are quantitative count and velocity metrics (mentions/min, unique author ratio, engagement velocity, bot-spam heuristic).
- AI (LLM) is used strictly for narrative clustering and human explainability summaries, never for trading decisions or overriding hard vetoes.

---

## 1. Social Event Ingestion & Velocity (`packages/core/src/social/`)
- **`SocialEventIngester`**:
  - Ingests structured social events from X, Telegram, and Discord.
  - Computes SHA-256 content hashes to deduplicate retweets/duplicate messages.
- **`SocialVelocityCalculator`**:
  - Computes:
    - Mention velocity ($\text{mentions} / \text{min}$)
    - Engagement velocity ($\text{likes + retweets} / \text{min}$)
    - Unique Author Ratio ($\frac{\text{UniqueAuthors}}{\text{TotalMentions}}$)
  - **Bot Raid Spam Detector**: Flags suspected bot spam if unique author ratio $< 0.25$ with $> 15$ mentions.

---

## 2. Narrative Clustering & Acceleration (`packages/core/src/narrative/`)
- **Canonical Solana Narratives**:
  - `Autonomous AI Agents` (agent, autonomous, ai, llm, terminal, eliza)
  - `Cats & Cute Animals` (cat, kitty, dog, doge, wif, pepe, frog)
  - `Politifi & Macro Culture` (trump, biden, maga, election, fed)
  - `DeSci & Quantum Tech` (quantum, desci, physics, energy, space)
  - `Cult & Degenerate Lore` (cult, based, anon, degen, chad)
- **`NarrativeClusterEngine`**:
  - Maps tokens to narrative clusters using semantic keyword taxonomies.
- **`NarrativeMomentumCalculator`**:
  - Computes narrative-wide mention velocity, velocity acceleration ($\Delta v$), active token count, and composite momentum score ($0 - 100$).
- **`NarrativeSummarizer`**:
  - Generates concise, structured summaries explaining narrative fit and organic discussion health.

---

## 3. Worker Jobs & API Endpoints
- **Worker Job**:
  - `NarrativeJob`: Sweeps unlinked tokens and clusters them into active narratives.
- **API Endpoints**:
  - `GET /api/v1/narratives`: List active narratives ranked by momentum score.
  - `POST /api/v1/narratives/detect`: Detect narrative taxonomy for a token.
  - `POST /api/v1/social/events`: Ingest batch social events with deduplication.
  - `GET /api/v1/social/:tokenId`: Social velocity and narrative summary for a token.
