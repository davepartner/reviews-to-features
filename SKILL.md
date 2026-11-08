---
name: reviews-to-features
description: >-
  Turn negative user feedback into an actionable, itemized feature backlog. Collects negative reviews
  from the Google Play Store, Apple App Store, Twitter/X, Reddit, or a pasted list of customer
  complaints; clusters, classifies, and ranks them (severity-first, with a critical fast lane);
  converts each cluster into a fix, gap, or opportunity with acceptance criteria; then lets the user
  pick which to implement and verifies the result. Also inventories the user's current project and
  mines competitors' reviews to surface feature gaps and differentiation opportunities. Use when mining
  app-store reviews, analyzing customer complaints, doing competitive gap analysis, or building a
  voice-of-the-customer roadmap. Triggers: "analyze app reviews", "play store reviews", "app store
  reviews", "negative reviews", "customer complaints", "turn complaints into features", "feature
  backlog from feedback", "voice of the customer", "review mining", "competitor reviews", "competitive
  analysis", "gap analysis", "feature inventory", "what features am I missing".
---

# Reviews → Features — Feedback-Mining Skill

Turn the loudest, most frustrated voices in your reviews — and in your competitors' — into a
**ranked, itemized backlog** of fixes, gaps, and opportunities you can act on. This skill inventories
your current project, mines your negative feedback and your competitors' reviews, clusters and ranks
them, converts them into concrete requests, hands you a checklist to pick what gets built, and
verifies the result after implementation.

---

## The pipeline

```
Understand ──▶ Collect ──▶ Analyze ──▶ Convert ──▶ Select ──▶ Implement ──▶ Verify
 inventory     own +       own themes   fixes,       checklist    backlog      re-check
 (features)    competitor  + competitor gaps,        (you pick)   → code       the metric
               reviews     pain/praise  opportunities
```

0. **Understand** — inventory the current project's existing features (from the codebase/README, or
   ask). This anchors the gap analysis.
1. **Collect** — pull **your** negative reviews *and* **competitors'** reviews (negative + positive).
2. **Analyze** — cluster your complaints; extract competitors' pain points, requests, and praise.
3. **Convert** — emit **fixes** (your defects), **gaps** (features you lack), and **opportunities**
   (competitor pain points you can do better).
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

## Competitive analysis — mine competitors to find your gaps

Beyond your own complaints, mine **your competitors' reviews** to find what you're missing:

1. **Inventory your project** — list your existing features (read the codebase/README/routes; ask if
   ambiguous). This is your "have" list.
2. **Identify competitors** — 2–5 direct rivals.
3. **Mine their reviews** — pull **negative** (≤3★) *and* **positive** (4–5★) per competitor, then
   extract three signals:
   - **Pain points** — recurring complaints → an **opportunity** to do it better.
   - **Requests** — "I wish it had X" → a **gap** you may share.
   - **Praise** — recurring "I love X" → a **validated** feature (table stakes).
4. **Build the gap matrix** — cross your inventory against competitor signals:

   | Feature | You | Competitor | Signal | Action |
   |---------|-----|-----------|--------|--------|
   | CSV export | ✗ | ✓ praised | validated gap | **Add** (gap) |
   | Offline mode | ✗ | ✓ complained | gap + weakness | **Differentiate** (opportunity) |

5. **Emit suggestions** — **Fix** (your defect), **Gap** (a validated/requested feature you lack),
   **Opportunity** (a competitor pain point you can exploit).

Full method: `references/competitive-analysis.md`.

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

Each cluster becomes a **fix**, **gap**, or **opportunity**, presented split and itemized for selection:

```
FIXES
FR-001 · Fix data loss after update            [bug · critical · top]
FR-002 · Fix checkout crash on payment         [bug · blocker]

GAPS
FR-003 · Add CSV export                        [feature · high · competitor praised]

OPPORTUNITIES
FR-004 · Offer offline mode (competitors' sync breaks)  [feature · medium · differentiator]
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
- **Own the target** — mine your own product's reviews freely. Analyzing competitors' *public* reviews
  for gap analysis is fair market research, but don't copy their IP, don't bypass auth/paywalls, and
  never fabricate or alter complaints.

---

## References

- `references/sources.md` — endpoints + libraries per source, and cross-source dedupe.
- `references/analysis-framework.md` — clustering, classification, ranking, sampling in full.
- `references/competitive-analysis.md` — project inventory, competitor mining, gap matrix.
- `references/output-format.md` — fix/gap/opportunity schema, selection checklist, handoff, verify.
- `examples/worked-example.md` — a full input → analysis → features → checklist walkthrough.
- `examples/score.mjs` — reference ranking implementation (with `score.test.mjs`).
- `examples/fetch-appstore-reviews.mjs` — no-auth App Store RSS scraper.
