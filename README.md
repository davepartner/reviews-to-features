# Reviews → Features — an AI agent skill

> **This is an AI agent skill.** Turn the negative reviews and complaints your product gets into a
> **ranked, itemized feature backlog** — then implement the ones you pick.

This skill makes an agent (Claude Code, Codex, Cursor, OpenCode, …) act as a **voice-of-the-customer
analyst**: it collects negative feedback from the Play Store, App Store, Twitter/X, or a pasted list
of complaints, clusters and ranks it, and converts each cluster into a concrete feature request with
acceptance criteria. You pick what to build; the agent implements it test-first.

Stop guessing what users want. **Read it in the reviews.**

---

## What it does

```
Collect ──▶ Analyze ──▶ Convert ──▶ Select ──▶ Implement ──▶ Verify
 raw        clusters     defects/     checklist    backlog      re-check
 reviews      + ranks    features     (you pick)   → code       the metric
```

| Phase | What happens |
|-------|--------------|
| **Collect** | Pull negative reviews/complaints (Play Store, App Store, Twitter, or pasted) into one normalized list. |
| **Analyze** | Cluster by theme (single primary theme), classify, assign severity, and rank **severity-first**. |
| **Convert** | Emit one **defect or feature request** per cluster — problem, evidence, solution, acceptance criteria. |
| **Select** | Present an itemized checklist (defects vs features); **you** check the items you want. |
| **Implement** | Each selected item becomes a spec implemented test-first (failing test → pass → refactor). |
| **Verify** | Re-check the metric that motivated each item (crash rate, rating, funnel) to confirm the fix worked. |

---

## Input sources

| Source | How |
|--------|-----|
| **Apple App Store** | Public RSS feed — no auth (`examples/fetch-appstore-reviews.mjs`) |
| **Google Play Store** | Play Console Reviews API (OAuth, your own app); `google-play-scraper` is fragile |
| **Twitter / X** | X API v2 search (paid tier; free search is near-useless) |
| **Reddit / G2 / Trustpilot / HN** | search + public pages — see `references/sources.md` |
| **Pasted list** | Any CSV / support export / plain-text complaints — no tooling needed |

Exact endpoints and libraries: `references/sources.md`.

---

## The ranking (severity-first)

Frequency alone is a trap — a rare data-loss bug must outrank a common "add dark mode" request. So rank
in two tiers:

1. **Severity tier (primary):** `blocker > high > medium > low`. A **critical** item (`security`, or
   anything flagged `critical: true` — data loss, breach) pins **above** blocker.
2. **Prevalence (secondary, within a tier):**

```
prevalence = 100 × frequency × recency_weight
  frequency      = evidence_count / total_negative   (clamped 0–1)
  recency_weight = 0.5 + 0.5 × (recent_evidence / evidence)   (recent = last 90 days)
```

A tested reference implementation lives in `examples/score.mjs` — run `npm test` (or
`node --test examples/*.test.mjs`). Full method: `references/analysis-framework.md`.

---

## Structure

```
SKILL.md                              # the skill: pipeline, rules, privacy, references
references/
├── sources.md                        # endpoints + libraries per source (incl. Reddit/G2/etc.)
├── analysis-framework.md             # filter → cluster → classify → rank (severity-first)
└── output-format.md                  # defect/feature schema, selection checklist, verify
examples/
├── score.mjs                         # reference ranking implementation (testable)
├── score.test.mjs                    # unit tests for the ranking
├── worked-example.md                 # full input → analysis → features → checklist walkthrough
└── fetch-appstore-reviews.mjs        # no-auth App Store RSS scraper
package.json                          # `npm test` runs the ranking tests
CHANGELOG.md
LICENSE
```

---

## Pull it & start using

Copy this prompt into your agent to install the skill and run the pipeline:

```
Pull the reviews-to-features skill from
https://github.com/davepartner/reviews-to-features (pin it by tag or commit), read SKILL.md, and mine
negative feedback for this product:

1. Collect negative reviews from one of:
   - Google Play Store (appId: <YOUR_PACKAGE>)
   - Apple App Store (appId: <NUMERIC_ID>, country: us)
   - Twitter/X (query: "<YOUR_PRODUCT>" bug OR crash OR "doesn't work" OR terrible)
   - or the pasted complaints below.
2. Cluster, classify, and rank them using the formula in references/analysis-framework.md.
3. Emit itemized feature requests (FR-###) with problem, solution, and acceptance criteria.
4. Show me the selection checklist and WAIT for me to pick items before implementing anything.
5. For each item I select, write a failing test for its acceptance criteria, then implement to pass.

Pasted complaints (if any):
---
<paste your complaints / CSV here>
---
```

---

## Strengths & limitations

**Strengths**

- **Severity-first ranking** — a rare data-loss bug outranks a common "add dark mode" request; tested in
  `examples/score.mjs`.
- **Source-agnostic** — one pipeline for reviews, tweets, Reddit/G2, and pasted complaints.
- **Defect vs feature split** — bugs and enhancements get their own lane and urgency.
- **Actionable + verifiable output** — acceptance criteria double as tests, and each item carries a
  metric to re-check after shipping.
- **Privacy-first** — PII redaction is a pipeline step, not a suggestion.
- **Closes the loop** — selection → test-first implementation → verification.

**Limitations**

- **Scraping is fragile.** Unofficial store scrapers break, and Twitter search is paywalled — prefer
  official APIs and treat unofficial paths as best-effort.
- **Clustering is judgment.** Embedding similarity helps, but the theme grouping still needs a human
  sanity check before you commit to building.
- **Severity assignment is judgment too.** The tiering is objective once severity is set, but "blocker
  vs high" is still a human/LLM call.
- **Not a substitute for talking to users.** Reviews skew to the most frustrated; pair with direct
  research and your own metrics.

---

## Versioning

Pin by commit hash or tag when you pull it into a project. See `CHANGELOG.md`.

## License

MIT — see [LICENSE](./LICENSE).

---

## Search index — keywords

*Findable by AI agents and humans searching for review mining and voice-of-the-customer tooling:*

Negative reviews, app store reviews, play store reviews, app review analysis, customer complaints,
customer feedback, user feedback, complaints to features, feature requests, feature backlog, voice of
the customer, voice of customer, VoC, review mining, review analysis, feedback analysis, feedback
mining, sentiment analysis, product feedback, product roadmap, roadmap planning, bug reports from
reviews, bug triage, prioritize feedback, feature prioritization, product backlog, support tickets,
complaint analysis, turn complaints into features, reviews to requirements, requirements from feedback,
twitter mentions, brand monitoring, social listening, app review scraper, app store scraper, play
store scraper, google-play-scraper, app-store-scraper, itunes rss, customer reviews feed, acceptance
criteria, user stories, TDD backlog, defect triage, severity ranking, critical bug, data loss,
regression detection, app version, reddit, g2, trustpilot, hacker news.

AI agent skill, Claude Code skill, Claude skill, Cursor rules, AI coding rules, agent prompt, system
prompt, LLM rules, agentic development, developer skill, engineering skill, product skill, product
manager skill, product management, PM tool, voice of customer tool, feedback tool, review tool.
