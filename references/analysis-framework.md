# Analysis Framework — from complaints to ranked features

The deterministic, reproducible method. Follow it in order; keep the raw data and each intermediate
artifact so the result is auditable and re-runnable.

---

## Step 1 — Filter (keep only negative, actionable)

- **Reviews:** keep `rating <= 3`. Also drop low-rating reviews with no actionable content (e.g. "ok",
  "meh", or irrelevant noise).
- **Twitter / pasted:** keep items with **negative sentiment** and a concrete complaint. Drop pure
  praise, spam, and off-topic posts.

Discard personally identifying info from what you retain (see privacy rules in `SKILL.md`).

## Step 2 — Normalize

Map every item to `{ source, rating, text, date }`.

## Step 3 — Cluster (group by theme)

Assign each item to **one or two themes**. Themes are short, concrete phrases in the user's language:

- "checkout crashes on payment"
- "app is slow to start"
- "can't export my data"
- "too many ads"
- "login fails with Google"
- "no dark mode"

Guidance:
- Let themes **emerge from the data** (read a sample, draft themes, refine) — don't force a preset list.
- Prefer **specific** themes over generic ("checkout crash" > "bugs").
- Split if a theme mixes two distinct problems; merge if two themes are the same complaint worded
  differently.

## Step 4 — Classify

For each theme, assign:

**Category:**
`bug` · `performance` · `ux` · `feature` · `pricing` · `support` · `security` · `content`

**Severity:**
- `blocker` — app unusable, data loss, or crash affecting many users.
- `high` — breaks a core flow for some users.
- `medium` — real pain, workaround exists.
- `low` — annoyance / nice-to-have.

## Step 5 — Score & rank

```
frequency       = evidence_count / total_negative_reviews        (clamp 0–1)
severity_weight = blocker 1.0 · high 0.8 · medium 0.5 · low 0.25
recency_weight  = 0.5 + 0.5 × (recent_evidence / evidence)       (recent = last 90 days)

priority_score  = round(100 × frequency × severity_weight × recency_weight)
```

- `evidence_count` = number of items assigned to the theme.
- `recent_evidence` = items within the last 90 days.
- `total_negative_reviews` = the filtered set size (after Step 1).

Sort descending by `priority_score`. Break ties by severity, then evidence count.

## Step 6 — Convert

One **Feature Request** per theme, in ranked order. Follow `references/output-format.md` exactly so the
output is machine-readable for the implementation step.

## Worked scoring (illustrative)

`total_negative = 340`. Theme "checkout crash": 12 items, 9 recent, severity `blocker`.

```
frequency       = 12 / 340       = 0.035
severity_weight = 1.0
recency_weight  = 0.5 + 0.5 × (9/12) = 0.875
priority_score  = round(100 × 0.035 × 1.0 × 0.875) = 3   ← note: low because frequency is low
```

> **Reality check:** with a large review set, a single theme rarely exceeds a few percent of *all*
> negative reviews. Frequency is intentionally a share of the **negative** set, so the score is
> meaningful relative to other complaints — read it as a *ranking*, not an absolute magnitude. If you
> want blockers to dominate regardless, weight severity more heavily.
