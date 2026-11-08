# Output Format — defects, features, selection, handoff, verify

Four artifacts: the **ranked requests** (split defects/features), the **selection checklist**, the
**selected backlog**, and the **verify plan**.

---

## 1. Request schema (fix, gap, or opportunity)

```
<ID> · <title>                          [<kind> · <severity> · <tier> · prevalence <n>]
  kind:        <fix | gap | opportunity>
  source:      <play-store | app-store | twitter | reddit | pasted> (comma-joined)
  evidence:    <N> of <M> negative reviews (<P>%)   +   <N_recent> in last 90 days
  regression:  <true | false>   (spike in the latest app_version)
  problem:     <what users experience, paraphrased — no PII, no verbatim quote>
  solution:    <the proposed change, concrete and scoped>
  acceptance:  - <testable criterion 1>
               - <testable criterion 2>
  effort:      <S | M | L>
  metric:      <the number to re-check after implementing>
```

Rules:
- **Title** — imperative, user voice: "Fix …", "Add …", "Reduce …", "Remove …".
- **kind** — `fix` (your defect), `gap` (you lack a validated/requested feature), or
  `opportunity` (a competitor pain point you can do better).
- **problem** — anonymized paraphrase; no reviewer identity; a short reworded excerpt at most.
- **acceptance** — 2–4 testable statements; no vague words ("better", "nice").
- **metric** — how you'll verify the fix worked (crash-free sessions, star-rating, funnel %, re-review).

---

## 2. Selection checklist

Present split into **Fixes**, **Gaps**, and **Opportunities**, each ranked:

```markdown
## Fixes
- [ ] FR-001 Fix data loss after update       (bug · critical)
- [ ] FR-002 Fix checkout crash on payment    (bug · blocker)

## Gaps
- [ ] FR-003 Add CSV export                   (feature · high · competitor praised)

## Opportunities
- [ ] FR-004 Offer offline mode               (feature · medium · differentiator)
```

The user checks items (or says "implement FR-001, FR-003"). For large lists, allow "select all
blockers", "top-N", or "all defects".

---

## 3. Selected backlog (handoff)

Write the chosen items to `BACKLOG.md`, ordered by rank, each expanded to a full spec:

```markdown
# Selected backlog

## FR-001 — Fix data loss after update  (defect · critical)
**Problem:** Users report notes disappearing after the latest update.
**Solution:** Restore the previous migration path and add a pre-update backup.
**Acceptance criteria:**
- [ ] Updating from any prior version preserves all notes.
- [ ] A failed migration rolls back without data loss.
**Metric:** data-loss reports drop to 0; no re-review mentioning lost notes.
```

---

## 4. Implementation (test-first)

For each selected item:

1. Turn each acceptance criterion into a failing test (red).
2. Implement the minimal change to pass (green).
3. Refactor and confirm tests still pass.

The acceptance criteria *are* the test cases.

---

## 5. Verify

After implementing, re-check each item's `metric`:

- **Bug/crash** → re-pull recent reviews, watch crash-free-session rate.
- **Performance** → re-measure (startup, load).
- **Feature** → watch adoption/usage and new reviews.

A fix is not "done" until the metric moved in the right direction. If it didn't, reopen the item.
