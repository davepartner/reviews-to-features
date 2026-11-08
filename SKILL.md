---
name: reviews-to-features
description: >-
  Turn negative user feedback into an actionable, itemized feature backlog. Collects negative reviews
  from the Google Play Store, Apple App Store, Twitter/X, Reddit, or a pasted list of customer
  complaints; clusters, classifies, and ranks them (severity-first, with a critical fast lane);
  converts each cluster into a defect or feature request with acceptance criteria; then lets the user
  pick which to implement and verifies the result. Use when mining app-store reviews, analyzing
  customer complaints, building a voice-of-the-customer roadmap, or turning negative feedback into
  prioritized fixes. Triggers: "analyze app reviews", "play store reviews", "app store reviews",
  "negative reviews", "customer complaints", "turn complaints into features", "feature backlog from
  feedback", "voice of the customer", "review mining", "what are users complaining about".
---

# Reviews → Features — Feedback-Mining Skill

Turn the loudest, most frustrated voices in your reviews into a **ranked, itemized backlog** of
defects and features you can act on. This skill collects negative feedback, clusters and ranks it,
converts it into concrete requests, hands you a checklist to pick what gets built, and verifies the
result after implementation.

---

## The pipeline

```
Collect ──▶ Analyze ──▶ Convert ──▶ Select ──▶ Implement ──▶ Verify
  raw        clusters     defects/     checklist    backlog        re-check
 reviews      + ranks     features     (you pick)   → code         the metric
```

1. **Collect** — pull negative reviews/complaints into a normalized list.
2. **Analyze** — cluster by theme (single primary theme), classify, and rank **severity-first**.
3. **Convert** — emit one **defect** or **feature request** per cluster, with acceptance criteria.
4. **Select** — present an itemized checklist; the user checks what to build.
5. **Implement** — each selected item becomes a spec implemented test-first.
6. **Verify** — re-check the metric that motivated the item (crash rate, rating, funnel, review
   sentiment) to confirm the fix actually worked.

---

## The ranking (severity-first, not frequency-first)

Frequency alone is a trap: a catastrophic but rare bug (data loss) must outrank a common but trivial
request ("add dark mode"). So rank in two tiers:

1. **Severity tier (primary):** `blocker > high > medium > low`. A **critical** item (`security`
   category, or anything flagged `critical: true` — data loss, breach) pins **above** blocker.
2. **Prevalence (secondary, within a tier):**
   ```
   prevalence = 100 × frequency × recency_weight
     frequency      = evidence_count / total_negative   (clamped 0–1)
     recency_weight = 0.5 + 0.5 × (recent_evidence / evidence)   (recent = last 90 days)
   ```

Sort by tier, then prevalence, then evidence count. A tested reference implementation is in
`examples/score.mjs` (`node --test examples/*.test.mjs`).

---

## Input sources

| Source | How | Caveat |
|--------|-----|--------|
| **Apple App Store** | Public RSS feed (no auth) — `examples/fetch-appstore-reviews.mjs` | per-storefront, ~500 entries/page |
| **Google Play Store** | Play Console Reviews API (OAuth, your own app) | no public official API; `google-play-scraper` is fragile |
| **Twitter / X** | X API v2 search | paid tier; free search is near-useless |
| **Reddit / G2 / Trustpilot / HN** | search + public pages | see `references/sources.md` |
| **Pasted list** | any CSV / support export / plain text | no tooling |

Exact endpoints: `references/sources.md`.

---

## The analysis rules (core, self-contained)

1. **Filter** — keep only negative, actionable feedback (rating ≤ 3 stars, or negative sentiment with a
   concrete complaint). Drop praise, spam, and noise.
2. **Redact PII** — before storing, strip reviewer names/emails/handles. Keep aggregate counts and
   short, anonymized paraphrases — **not** verbatim quotes (quotes are searchable and deanonymizing).
3. **Cluster** — assign each item to exactly **one primary theme**. Embed the text, group by cosine
   similarity ≥ a threshold (0.8), and name each theme canonically (imperative, ≤ 6 words:
   "Fix checkout crash", "Add CSV export"). Dedupe near-duplicate themes.
4. **Classify** — category (`bug | performance | ux | feature | pricing | support | security | content`)
   and severity (`blocker | high | medium | low`). Map to **type**: `defect` for
   `bug | performance | security`; `feature` for `feature | pricing | content` (use `ux` case-by-case).
5. **Rank** — severity-first (above), then prevalence. Flag regressions: a theme that spikes in the
   latest `app_version` is a release-introduced bug — promote it.
6. **Sample for scale** — for large sets, sample stratify by rating + recency (cap ~500) before
   clustering.

Full detail: `references/analysis-framework.md`.

---

## Output format

Each cluster becomes a **defect** or **feature** request, presented split and itemized for selection:

```
DEFECTS
FR-001 · Fix data loss after update            [bug · critical · top]
FR-002 · Fix checkout crash on payment         [bug · blocker]

FEATURES
FR-003 · Add CSV export                        [feature · high]
FR-004 · Add dark mode                         [ux · low]
```

Schema + the selection checklist + the test-first handoff: `references/output-format.md`.

---

## Selection → implementation → verify

1. User checks items (or says "implement FR-001, FR-003").
2. Write the selected items to `BACKLOG.md`, each with problem / solution / acceptance criteria.
3. Implement **test-first**: each acceptance criterion becomes a failing test, then pass, then refactor.
4. **Verify**: define and re-check the metric that motivated each item (crash rate, rating, funnel,
   re-review) — a fix isn't done until the number moved.

---

## Privacy & ethics (non-negotiable)

- **Redact PII** in the normalize step (above). Store aggregates + anonymized paraphrases, not raw
  quotes. Honour GDPR erasure requests.
- **Retention:** scraped reviews are personal data — keep a retention limit and delete stale pulls.
- **Prefer official APIs**, respect rate limits and ToS. Scraping can break and may violate ToS.
- **Own the target** — use on your own product, not a competitor's, and never fabricate or alter
  complaints.

---

## References

- `references/sources.md` — endpoints + libraries per source, and cross-source dedupe.
- `references/analysis-framework.md` — clustering, classification, ranking, sampling in full.
- `references/output-format.md` — defect/feature schema, selection checklist, handoff, verify.
- `examples/worked-example.md` — a full input → analysis → features → checklist walkthrough.
- `examples/score.mjs` — reference ranking implementation (with `score.test.mjs`).
- `examples/fetch-appstore-reviews.mjs` — no-auth App Store RSS scraper.
