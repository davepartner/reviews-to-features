# Output Format — Feature Requests, selection, and handoff

Three artifacts: the **ranked feature requests**, the **selection checklist**, and the **selected
backlog** (implementation handoff).

---

## 1. Feature Request schema

```
FR-### · <title>                          [<category> · <severity> · <priority_score>]
  source:      <play-store | app-store | twitter | pasted> (comma-joined if multiple)
  evidence:    <N> of <M> negative reviews (<P>%)   +   <N_recent> in last 90 days
  problem:     <what users experience, in their own words>
  solution:    <the proposed change, concrete and scoped>
  acceptance:  - <testable criterion 1>
               - <testable criterion 2>
  effort:      <S | M | L>   (optional estimate)
```

Rules:
- **Title** — imperative and in the user's voice: "Fix …", "Add …", "Reduce …", "Remove …".
- **problem** — paraphrase faithfully; include one short verbatim quote (un-attributed) if helpful.
- **acceptance** — 2–4 statements that can be turned into tests. Avoid vague words ("better", "nice").

---

## 2. Selection checklist

Present all feature requests, ranked, as a Markdown checkbox list the user edits:

```markdown
## Feature requests — pick what to implement

- [ ] FR-001 Fix checkout crash on the payment screen  (bug · blocker · 87)
- [ ] FR-002 Add CSV export                            (feature · high · 72)
- [ ] FR-003 Reduce startup time to under 2s           (performance · medium · 55)
- [ ] FR-004 Add dark mode                              (ux · low · 30)
```

The user checks the boxes they want (or says "implement FR-001, FR-003"). Detect checked items, or
parse the explicit IDs.

---

## 3. Selected backlog (implementation handoff)

Write the chosen items to `BACKLOG.md` (or `backlog.json`), ordered by priority, each expanded to a
full implementation spec:

```markdown
# Selected backlog

## FR-001 — Fix checkout crash on the payment screen
**Category / severity:** bug · blocker
**Evidence:** 12 of 340 negative reviews; 9 in the last 90 days.
**Problem:** Tapping "Pay" crashes the app for some users on the latest version.
**Solution:** Null-guard the order-total calculation and add a retry path on payment failure.
**Acceptance criteria:**
- [ ] Checkout completes without crashing on the payment screen.
- [ ] A failed payment shows an inline error and allows retry without restart.
**Effort:** M
```

---

## 4. Implementation (test-first)

For each selected item, before writing the fix:

1. Turn each acceptance criterion into a failing test (the *red* step).
2. Implement the minimal change to pass (the *green* step).
3. Refactor and confirm the tests still pass.

The acceptance criteria above *are* the test cases — the handoff is complete when every criterion has
a passing test.
