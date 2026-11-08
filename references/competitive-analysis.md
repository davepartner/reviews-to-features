# Competitive Analysis — from competitor reviews to improvement suggestions

Turn **competitors'** reviews into a source of ideas for *your* product. This runs alongside the
own-review mining and adds a "gap" dimension: what do competitors' users want (and complain about)
that your app could provide — or do better?

---

## Step 0 — Inventory the current project

Before comparing, know what you already have.

- **Detect the project** — check the working directory / repo. Read the `README`, package manifest,
  routes/controllers/views, feature flags, or any docs/feature list.
- **Produce a feature inventory** — a plain list of what exists:

  ```
  - note taking (create / edit / delete)
  - dark mode          ✅ exists
  - CSV export         ❌ missing
  - offline mode       ❌ missing
  ```

- **If ambiguous, ask.** "What does your app do, and what features does it already have?" Better to ask
  than to guess the inventory — the gap matrix is only as good as the "have" column.

## Step 1 — Identify competitors

- Ask the user, or infer from the domain. Aim for **2–5 direct rivals** (same problem, same audience).
- Record each competitor's name + store id / url.

## Step 2 — Mine competitor reviews (negative AND positive)

Use the same sources as `references/sources.md`, but collect **both**:

- **Negative** (rating ≤ 3) — where competitors fail.
- **Positive** (rating ≥ 4) — what competitors' users love.

Pull roughly the same volume per competitor so the comparison is fair.

## Step 3 — Extract three signals

Per competitor, cluster and summarize (same discipline as `analysis-framework.md` — single primary
theme, similarity threshold, canonical names):

| Signal | From | Meaning |
|--------|------|---------|
| **Pain points** | negative reviews | recurring complaints — their weakness |
| **Requests** | negative reviews ("I wish it had X", "missing X") | features their users want |
| **Praise** | positive reviews ("love the X") | validated features — table stakes |

## Step 4 — Build the gap matrix

Cross your **feature inventory** against the competitor signals:

```
| Feature         | You | Competitor | Signal              | Action                   |
|-----------------|-----|------------|---------------------|--------------------------|
| CSV export      |  ✗  | ✓ praised  | validated gap       | Add (Gap)                |
| Offline mode    |  ✗  | ✓ complained| gap + their weakness| Differentiate (Opportunity) |
| Dark mode       |  ✓  | ✓          | parity              | —                        |
| Fast sync       |  ✓  | ✗          | your advantage      | keep + market it         |
```

Rows where **you = ✗** are candidates. A row where **you = ✓** and they don't is a differentiator to
*keep and market* — not to build.

## Step 5 — Emit suggestions (three kinds)

- **Fix** — your own app is broken (from your negative reviews). Existing pipeline.
- **Gap** — you lack a feature competitors' users praise or request. Severity `high` when *praised*
  (validated), `medium`/`low` when only *requested*.
- **Opportunity** — competitors' users are unhappy about something you can do better. Severity scales
  with how widespread the complaint is; it is a *differentiator*, not just a feature.

All three flow through the same severity-first ranking and the same output schema — add a `kind` field
and cite the gap-matrix row as evidence.

## Step 6 — Prioritize

- **Fixes** (your defects) outrank gaps/opportunities when they're blockers — a broken core beats a
  nice-to-have.
- Among **gaps**, prioritize validated ones (competitor praise) over merely-requested.
- **Opportunities** are strategic — weigh them against effort; a cheap, high-complaint opportunity can
  be a quick win.

The reference ranking (`examples/score.mjs`) still orders everything: map `kind` → `severity`
(blocker defects stay blocker; validated gaps → high; opportunities → per complaint spread), then let
severity-first ordering do the rest.

---

## Ethics note

Analyzing competitors' **public** reviews for gap analysis is fair market research. Do **not**: copy
their IP, bypass auth or paywalls, or fabricate/alter what their users said.
