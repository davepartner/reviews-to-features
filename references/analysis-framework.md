# Analysis Framework — from complaints to ranked requests

The deterministic, reproducible method. Follow it in order; keep the raw data and each intermediate
artifact so the result is auditable and re-runnable.

---

## Step 1 — Filter (keep only negative, actionable)

- **Reviews:** keep `rating <= 3`. Drop low-rating reviews with no actionable content ("ok", "meh",
  noise).
- **Twitter / pasted / forums:** keep items with **negative sentiment** and a concrete complaint. Drop
  praise, spam, and off-topic posts.

## Step 2 — Normalize + redact PII

Map every item to `{ source, rating, text, date, app_version? }`.

**Redact before storing:** remove reviewer usernames, emails, and handles. Store aggregate counts and
short **anonymized paraphrases**, not verbatim quotes — a verbatim quote is often searchable and
deanonymizing. If you must keep a quote, truncate and reword it.

## Step 3 — Sample (for large sets)

If the filtered set is large (say > 500), sample rather than read everything:

- Stratify by **rating** (1★, 2★, 3★) and **recency** (last 90 days vs older).
- Cap the sample (e.g. 500 items).
- Record the sample size and treat `evidence_count` as *of the sample*, noting it in the output.

## Step 4 — Cluster (single primary theme)

Assign each item to **exactly one** primary theme. A deterministic recipe:

1. **Embed** each item's text (any embedding model).
2. **Group** items whose cosine similarity is **≥ 0.8** (adjust the threshold up for tighter themes,
   down for broader ones).
3. **Name** each theme canonically: imperative, ≤ 6 words — "Fix checkout crash", "Add CSV export",
   "Reduce startup time".
4. **Dedupe near-duplicate themes** (two themes with mean cross-similarity ≥ 0.8 are one).

Single-primary assignment removes double-counting: each item contributes to exactly one
`evidence_count`.

## Step 5 — Classify

For each theme:

**Category** — `bug · performance · ux · feature · pricing · support · security · content`.

**Type** — map category to type:

| Category | Type |
|----------|------|
| bug · performance · security | **defect** |
| feature · pricing · content | **feature** |
| ux | defect if "broken/confusing", feature if "enhancement" — decide case-by-case |

**Severity** — `blocker · high · medium · low`:
- `blocker` — app unusable, data loss, or crash affecting many users.
- `high` — breaks a core flow for some users.
- `medium` — real pain, workaround exists.
- `low` — annoyance / nice-to-have.

**Critical flag** — mark `critical: true` for anything in the `security` category or involving data
loss / account compromise, even at low evidence count.

## Step 6 — Rank (severity-first)

**Primary — severity tier:**

```
blocker (3) > high (2) > medium (1) > low (0)
critical  pins ABOVE blocker
```

**Secondary — prevalence (within a tier):**

```
prevalence = 100 × frequency × recency_weight
  frequency      = evidence_count / total_negative   (clamped 0–1)
  recency_weight = 0.5 + 0.5 × (recent_evidence / evidence)   (recent = last 90 days)
```

Sort by tier (descending), then prevalence (descending), then evidence count. This is the reference
`examples/score.mjs`; run `node --test examples/*.test.mjs` to verify it.

**Why severity-first:** a rare data-loss bug must outrank a common "add dark mode" request. Frequency
orders *within* a tier; it never overrides severity.

## Step 7 — Regression flagging

If `app_version` is present, compare each theme's rate in the **latest version** vs older versions. A
theme that spikes in the latest version is a **release-introduced bug** — flag it `regression: true`
and promote it (it's fresh breakage, not a long-standing complaint).

## Worked ranking (illustrative)

`total_negative = 340`.

| Theme | evidence | severity | category | critical | tier | prevalence |
|-------|----------|----------|----------|----------|------|------------|
| Data loss after update | 2 | blocker | bug | ✅ | above blocker | 1 |
| Checkout crash | 12 | blocker | bug | — | blocker | 4 |
| CSV export | 30 | high | feature | — | high | 9 |
| Dark mode | 100 | low | ux | — | low | 29 |

Even though "dark mode" has 100 mentions, the 2-mention data-loss bug and the 12-mention crash rank
above it. That's the point of severity-first ranking.
