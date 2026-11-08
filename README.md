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
Collect ──▶ Analyze ──▶ Convert ──▶ Select ──▶ Implement
 raw        clusters     features     checklist    backlog → code
 reviews      + ranks     (itemized)   (you pick)  (test-first)
```

| Phase | What happens |
|-------|--------------|
| **Collect** | Pull negative reviews/complaints (Play Store, App Store, Twitter, or pasted) into one normalized list. |
| **Analyze** | Cluster by theme, classify (bug vs feature vs UX vs pricing…), assign severity, and rank by a transparent score. |
| **Convert** | Emit one **feature request** per cluster — problem, evidence, solution, acceptance criteria. |
| **Select** | Present an itemized checklist; **you** check the items you want. |
| **Implement** | Each selected item becomes a spec implemented test-first (failing test → pass → refactor). |

---

## Input sources

| Source | How |
|--------|-----|
| **Google Play Store** | Play Console Reviews API (OAuth) or `google-play-scraper` |
| **Apple App Store** | Public RSS feed — no auth (`examples/fetch-appstore-reviews.mjs`) |
| **Twitter / X** | X API v2 search for brand mentions + complaint keywords |
| **Pasted list** | Any CSV / support export / plain-text complaints — no tooling needed |

Exact endpoints and libraries: `references/sources.md`.

---

## The scoring formula (transparent & reproducible)

```
priority_score = round(100 × frequency × severity_weight × recency_weight)
  frequency      = evidence_count / total_negative_reviews   (clamped 0–1)
  severity_weight = blocker 1.0 · high 0.8 · medium 0.5 · low 0.25
  recency_weight  = 0.5 + 0.5 × (recent_evidence / evidence)  (recent = last 90 days)
```

Full method (filtering, clustering, classification): `references/analysis-framework.md`.

---

## Structure

```
SKILL.md                              # the skill: pipeline, rules, privacy, references
references/
├── sources.md                        # exact endpoints + libraries per source
├── analysis-framework.md             # filter → cluster → classify → score
└── output-format.md                  # feature-request schema, selection checklist, handoff
examples/
├── worked-example.md                 # full input → analysis → features → checklist walkthrough
└── fetch-appstore-reviews.mjs        # no-auth App Store RSS scraper
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

- **Source-agnostic** — one pipeline for reviews, tweets, and pasted complaints.
- **Transparent ranking** — a reproducible score, not vibes; every item traces to evidence counts.
- **Actionable output** — each item has acceptance criteria that double as test cases.
- **Privacy-first** — anonymizes reviewers, prefers official APIs, respects ToS.
- **Closes the loop** — selection feeds a test-first implementation handoff.

**Limitations**

- **Scraping is fragile.** Unofficial store scrapers can break; prefer the authorized APIs. Twitter
  search requires a paid tier.
- **Frequency ≠ importance.** A rare but catastrophic bug (e.g. data loss for 1%) scores low on raw
  frequency — the severity weight helps, but you should still review blockers manually.
- **Clustering is judgment.** The LLM's theme grouping needs a human sanity check before you commit to
  building.
- **Not a substitute for talking to users.** Reviews skew to the most frustrated; pair this with direct
  customer research.

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
criteria, user stories, TDD backlog.

AI agent skill, Claude Code skill, Claude skill, Cursor rules, AI coding rules, agent prompt, system
prompt, LLM rules, agentic development, developer skill, engineering skill, product skill, product
manager skill, product management, PM tool, voice of customer tool, feedback tool, review tool.
