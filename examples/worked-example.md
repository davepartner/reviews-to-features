# Worked Example — from complaints to a feature backlog

A realistic walkthrough of the full pipeline on a small, pasted set of complaints for a fictional
"NoteVault" app. This shows the *shape* of the transformation; run it on your own data with the full
method in `references/analysis-framework.md`.

---

## 1. Input (pasted complaints)

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
```

---

## 2. Analyze (cluster + classify + score)

`total_negative = 10`.

| Theme | Items | Category | Severity | Evidence | Recent | Score |
|-------|-------|----------|----------|----------|--------|-------|
| Checkout crash on payment | 4 | bug | blocker | 4/10 = 0.40 | 4/4 | 100 × 0.40 × 1.0 × 1.0 = **40** |
| No CSV export | 3 | feature | high | 0.30 | 3/3 | 100 × 0.30 × 0.8 × 1.0 = **24** |
| Slow startup | 3 | performance | medium | 0.30 | 3/3 | 100 × 0.30 × 0.5 × 1.0 = **15** |
| No dark mode | 2 | ux | low | 0.20 | 2/2 | 100 × 0.20 × 0.25 × 1.0 = **5** |

---

## 3. Convert → feature requests

```
FR-001 · Fix checkout crash on the payment screen          [bug · blocker · 40]
  source:      pasted
  evidence:    4 of 10 negative complaints (40%)
  problem:     Tapping "Pay" crashes the app, blocking purchase.
  solution:    Null-guard the order-total calculation and add a payment retry path.
  acceptance:  - Checkout completes without crashing on the payment screen.
               - A failed payment shows an inline error and allows retry without restart.

FR-002 · Add CSV export                                   [feature · high · 24]
  source:      pasted
  evidence:    3 of 10 (30%)
  problem:     Users cannot export their notes.
  solution:    Add an "Export as CSV" action in the notes list.
  acceptance:  - Exporting produces a valid CSV of all notes.
               - The export works on an empty and a large notebook.

FR-003 · Reduce startup time                              [performance · medium · 15]
  source:      pasted
  evidence:    3 of 10 (30%)
  problem:     Cold start shows a blank screen for ~10s.
  solution:    Lazy-load non-critical modules; show a skeleton during startup.
  acceptance:  - Cold start renders within 2s on a mid-range device.
               - No blank screen — a skeleton/placeholder is shown while loading.

FR-004 · Add dark mode                                    [ux · low · 5]
  source:      pasted
  evidence:    2 of 10 (20%)
  problem:     No dark theme.
  solution:    Add a dark theme with a toggle and system preference support.
  acceptance:  - A toggle switches light/dark.
               - System dark-mode preference is honoured by default.
```

---

## 4. Select (user picks)

```markdown
## Feature requests — pick what to implement
- [x] FR-001 Fix checkout crash on the payment screen  (bug · blocker · 40)
- [ ] FR-002 Add CSV export                            (feature · high · 24)
- [ ] FR-003 Reduce startup time                       (performance · medium · 15)
- [x] FR-004 Add dark mode                             (ux · low · 5)
```

User checked **FR-001** and **FR-004** (or said "implement FR-001 and FR-004").

---

## 5. Selected backlog → implementation

`BACKLOG.md`:

```markdown
## FR-001 — Fix checkout crash on the payment screen
**bug · blocker**
**Problem:** Tapping "Pay" crashes the app, blocking purchase.
**Solution:** Null-guard the order-total calculation and add a payment retry path.
**Acceptance criteria:**
- [ ] Checkout completes without crashing on the payment screen.
- [ ] A failed payment shows an inline error and allows retry without restart.

## FR-004 — Add dark mode
**ux · low**
**Problem:** No dark theme.
**Solution:** Add a dark theme with a toggle and system preference support.
**Acceptance criteria:**
- [ ] A toggle switches light/dark.
- [ ] System dark-mode preference is honoured by default.
```

Each acceptance criterion becomes a failing test first, then the implementation makes it pass.
