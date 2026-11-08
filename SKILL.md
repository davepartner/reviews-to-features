---
name: reviews-to-features
description: >-
  Turn negative user feedback into an actionable, itemized feature backlog. Collects negative reviews
  from the Google Play Store, Apple App Store, Twitter/X (for websites), or a pasted list of customer
  complaints; clusters, classifies, and ranks them; converts each cluster into a feature request with
  acceptance criteria; then lets the user pick which items to implement. Use when mining app-store
  reviews, analyzing customer complaints, building a voice-of-the-customer roadmap, or turning negative
  feedback into prioritized fixes. Triggers: "analyze app reviews", "play store reviews", "app store
  reviews", "negative reviews", "customer complaints", "turn complaints into features", "feature
  backlog from feedback", "voice of the customer", "review mining", "what are users complaining about".
---

# Reviews → Features — Feedback-Mining Skill

Turn the loudest, most frustrated voices in your reviews into a **ranked, itemized feature backlog**
you can act on. This skill collects negative feedback, makes sense of it, converts it into concrete
feature requests, and hands you a checklist to pick what gets built.

It is **source-agnostic** — it works identically whether the input is Play Store reviews, App Store
reviews, Twitter/X mentions, or a pasted list of complaints from your support inbox.

---

## The pipeline

```
Collect ──▶ Analyze ──▶ Convert ──▶ Select ──▶ Implement
  raw        clusters     features     checklist    backlog → code
 reviews      + ranks     (itemized)   (user picks) (TDD handoff)
```

1. **Collect** — pull negative reviews/complaints from one or more sources into a normalized list.
2. **Analyze** — cluster them by theme, classify (bug vs UX vs feature vs pricing…), assign severity,
   and rank by a transparent score.
3. **Convert** — emit one **feature request** per cluster, with problem, evidence, solution, and
   acceptance criteria.
4. **Select** — present an itemized checklist; the user checks the items they want.
5. **Implement** — each selected item becomes a spec with acceptance criteria, implemented test-first.

---

## Input sources

| Source | How | Notes |
|--------|-----|-------|
| **Google Play Store** | Play Console Reviews API (OAuth) or `google-play-scraper` | Reviews are public; the API is the authorized path |
| **Apple App Store** | Public RSS feed (`itunes.apple.com/.../rss/customerreviews/.../json`) — no auth | See `examples/fetch-appstore-reviews.mjs` |
| **Twitter / X** | X API v2 (search recent) for brand mentions | For websites; needs an API key |
| **Pasted list** | Any CSV / plain text / support export | No tooling required |

Exact endpoints and library references: `references/sources.md`.

---

## The analysis framework (summary)

1. **Filter** — keep only negative, actionable feedback (rating ≤ 3 stars, or negative sentiment).
2. **Normalize** — map every source to one review shape: `{ source, rating, text, date }`.
3. **Cluster** — group by theme ("checkout crashes", "too many ads", "can't export"). Allow multi-label.
4. **Classify** — category (`bug | performance | ux | feature | pricing | support | security`) and
   severity (`blocker | high | medium | low`).
5. **Score** — a transparent, reproducible priority:

```
priority_score = round(100 × frequency × severity_weight × recency_weight)

  frequency      = evidence_count / total_negative_reviews   (clamped to 1)
  severity_weight = blocker 1.0 · high 0.8 · medium 0.5 · low 0.25
  recency_weight  = 0.5 + 0.5 × (recent_evidence / evidence)  (recent = last 90 days)
```

6. **Rank** — sort by `priority_score` descending.

Full detail, including clustering guidance and worked scoring: `references/analysis-framework.md`.

---

## Output format

Each cluster becomes a **Feature Request** (schema in `references/output-format.md`):

```
FR-003 · Fix checkout crash on the payment screen          [bug · blocker · 87]
  source: app-store + play-store
  evidence: 12 of 340 negative reviews (3.5%)
  problem: Users report the app crashes when tapping "Pay"…
  solution: …
  acceptance: [ "Checkout completes without crashing", "No crash on retry", … ]
```

Feature requests are presented as an **itemized checklist** for selection:

```markdown
## Feature requests (ranked)
- [ ] FR-001 Fix checkout crash on the payment screen  (bug · blocker · 87)
- [ ] FR-002 Add CSV export  (feature · high · 72)
- [ ] FR-003 Reduce startup time  (performance · medium · 55)
```

The user checks the items they want (or says "implement FR-001, FR-003"). See
`references/output-format.md` for the exact schema and handoff artifact.

---

## Selection → implementation handoff

After the user picks items, write a **selected backlog** (`BACKLOG.md`) where each item is a full spec:

1. **Title** — in the user's voice, actionable.
2. **Problem** — what users experience, with evidence (quote count, source).
3. **Solution** — the proposed change.
4. **Acceptance criteria** — testable statements.
5. **Priority / effort** — from the analysis.

Then implement **test-first**: for each item, write a failing test for its acceptance criteria, make it
pass, refactor. This plugs into any existing implementation workflow (TDD, planner, etc.).

---

## Privacy & ethics (non-negotiable)

- **Anonymize.** Strip reviewer usernames/emails from stored data; keep aggregate counts and short,
  un-attributed quotes. Comply with GDPR (honour erasure requests).
- **Prefer official APIs** and respect rate limits and terms of service. Do not bypass auth or scrape
  in bulk against a provider's ToS.
- **Own the target.** Use this on your own app/product (or with permission). Do not mine a competitor's
  reviews to copy them.
- **Quote faithfully.** Never fabricate or alter a complaint to make a point; mark paraphrases as such.

---

## References

- `references/sources.md` — exact endpoints and libraries for Play Store, App Store, Twitter, pasted.
- `references/analysis-framework.md` — filtering, clustering, classification, and the scoring formula.
- `references/output-format.md` — the Feature Request schema, selection checklist, and handoff artifact.
- `examples/worked-example.md` — a full input → analysis → feature-request → checklist walkthrough.
- `examples/fetch-appstore-reviews.mjs` — a no-auth scraper for the App Store public feed.
