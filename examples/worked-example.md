# Worked Example — from complaints to a ranked backlog

A realistic walkthrough on a small, pasted set of complaints for a fictional "NoteVault" app. It
demonstrates the **severity-first** ranking and the **critical fast lane** (a rare data-loss report
outranks a common request).

---

## 1. Input (pasted complaints, PII redacted)

```
- App crashes every time I tap Pay on the checkout screen. Unusable!
- Can't export my notes to CSV, this is a dealbreaker for me.
- Tapping Pay crashes the app. I can't buy the pro plan.
- The app takes forever to open on my phone.
- Please add dark mode, my eyes hurt at night.
- Export is missing, I need my data.
- Slow to start, I see a blank screen for 10 seconds.
- Checkout crash — lost my order twice.
- Dark mode please!!
- Startup is painfully slow.
- After the last update all my notes disappeared!!
```

`total_negative = 11`.

---

## 2. Analyze (cluster → classify → rank)

| Theme | Evidence | Severity | Category | Type | Critical | Tier |
|-------|----------|----------|----------|------|----------|------|
| Data loss after update | 1 | blocker | bug | defect | ✅ | **above blocker** |
| Checkout crash on payment | 4 | blocker | bug | defect | — | blocker |
| No CSV export | 3 | high | feature | feature | — | high |
| Slow startup | 3 | medium | performance | defect | — | medium |
| No dark mode | 2 | low | ux | feature | — | low |

Prevalence (within tier) is informational: data loss `9`, checkout crash `36`, export `27`, startup
`27`, dark mode `18`.

**The point:** dark mode has 2× the mentions of the data-loss bug, but the data-loss bug and the crash
rank **above** it because severity is the primary sort key.

---

## 3. Convert → defects + features

### Defects

```
FR-001 · Fix data loss after update                          [defect · critical]
  evidence:  1 of 11 negative complaints (9%) — 1 in last 90 days
  regression: true (reports reference "after the last update")
  problem:   Users report notes disappearing after the latest update.
  solution:  Restore the previous migration path and add a pre-update backup.
  acceptance: - Updating from any prior version preserves all notes.
              - A failed migration rolls back without data loss.
  metric:     data-loss reports drop to 0.

FR-002 · Fix checkout crash on the payment screen            [defect · blocker]
  evidence:  4 of 11 (36%) — 4 in last 90 days
  problem:   Tapping "Pay" crashes the app, blocking purchase.
  solution:  Null-guard the order-total calculation and add a payment retry path.
  acceptance: - Checkout completes without crashing.
              - A failed payment shows an inline error and allows retry.
  metric:     crash-free sessions on the payment screen return to baseline.

FR-003 · Reduce startup time                                  [defect · medium]
  evidence:  3 of 11 (27%)
  problem:   Cold start shows a blank screen for ~10s.
  solution:  Lazy-load non-critical modules; show a skeleton during startup.
  acceptance: - Cold start renders within 2s on a mid-range device.
              - No blank screen — a skeleton is shown while loading.
  metric:     median cold-start time < 2s.
```

### Features

```
FR-004 · Add CSV export                                      [feature · high]
  evidence:  3 of 11 (27%)
  problem:   Users cannot export their notes.
  solution:  Add an "Export as CSV" action in the notes list.
  acceptance: - Exporting produces a valid CSV of all notes.
              - Export works on an empty and a large notebook.
  metric:     export usage + no "can't export" re-reviews.

FR-005 · Add dark mode                                       [feature · low]
  evidence:  2 of 11 (18%)
  problem:   No dark theme.
  solution:  Add a dark theme with a toggle and system-preference support.
  acceptance: - A toggle switches light/dark.
              - System dark-mode preference is honoured by default.
  metric:     adoption of the toggle.
```

---

## 4. Select (user picks)

```markdown
## Defects
- [x] FR-001 Fix data loss after update        (bug · critical)
- [x] FR-002 Fix checkout crash on payment     (bug · blocker)
- [ ] FR-003 Reduce startup time               (performance · medium)

## Features
- [ ] FR-004 Add CSV export                    (feature · high)
- [x] FR-005 Add dark mode                     (ux · low)
```

User checked **FR-001, FR-002, FR-005**.

---

## 5. Selected backlog → implement → verify

`BACKLOG.md` holds the three selected items, each with acceptance criteria (→ failing tests first) and
a `metric` to re-check after implementing. When the fix ships, re-pull recent reviews and confirm the
metric moved — data-loss reports at 0, no new "checkout crash" mentions, and dark-mode adoption rising.

---

## 6. Competitive angle — gap analysis (bonus)

Suppose NoteVault has two rivals, "NotePro" and "QuickNotes". Mining **their** reviews adds gaps and
opportunities on top of the fixes:

| Feature | NoteVault | Rivals | Signal | Action |
|---------|-----------|--------|--------|--------|
| CSV export | ✗ | ✓ praised ("love the export") | validated gap | **Gap** → add it |
| Offline mode | ✗ | ✓ complained ("syncs are unreliable offline") | gap + weakness | **Opportunity** → do it right |
| Dark mode | ✓ | ✓ | parity | — |

These fold into the same backlog as `kind: gap` / `kind: opportunity` items, ranked alongside the
fixes — a blocker fix still outranks a validated gap.
