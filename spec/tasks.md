# SpecJournalism — Task Checklist

## How to use

At the start of each analysis, copy this file into `reports/NN_slug/tasks.md`.
Replace `[DATASET_A]`, `[DATASET_B]` etc. with the actual dataset IDs from `data-design.md`.
Add rows for each additional dataset. Mark tasks `[x]` as you complete them.
Do not mark a checkpoint complete unless all tasks in its block are checked.

Tasks marked `[P]` can run in parallel with adjacent `[P]` tasks.

---

## Pre-phase block (SpecJournalism)

- [ ] SJ-0 — Load `spec/constitution.md` and confirm it is current
- [ ] SJ-1 — Run `/sj.brief` → produce `story-brief.md`
- [ ] SJ-2 — Run `/sj.clarify` → fill Clarifications in `story-brief.md`
- [ ] SJ-3 — Run `/sj.nullhyp` → fill Null hypothesis in `story-brief.md`
- [ ] SJ-4 — Run `/sj.design` → produce `data-design.md`

**CHECKPOINT A**: `story-brief.md` complete (angle, hook, scope, clarifications, null hypothesis)
AND `data-design.md` complete (datasets, filters, visualisation plan, commitments).
Do not enter the execution pipeline until both files exist and are approved.

---

## Phase 0 — Research question

- [ ] 0.1 — Write cleaned research question in `notes.md` (source: `story-brief.md`)
- [ ] 0.2 — Write statistical proxy in `notes.md` (source: `data-design.md`)
- [ ] 0.3 — Record candidate providers from `opensdmx providers` in `notes.md`

---

## Phase 1 — Dataset search and verification

- [ ] 1.1 [P] — Verify [DATASET_A] — confirm dimensions, coverage, availability
- [ ] 1.2 [P] — Verify [DATASET_B] — confirm dimensions, coverage, availability
- [ ] 1.3 [P] — Download metadata for every filtered dimension → `metadata/`
- [ ] 1.4 — Confirm dataset IDs in `data-design.md` against actual availability
  - If a dataset ID is wrong or unavailable: update `data-design.md` v[X.X+1] before proceeding

---

## Phase 2 — Data acquisition

- [ ] 2.1 — Acquire [DATASET_A] with filters from `data-design.md` → `output/A_[slug].csv`
- [ ] 2.2 — Run double-check for Dataset A (two independent runs)
- [ ] 2.3 — Save `queries/A_[slug].yaml`
- [ ] 2.4 [P] — Acquire [DATASET_B] → `output/B_[slug].csv`
- [ ] 2.5 [P] — Run double-check for Dataset B
- [ ] 2.6 [P] — Save `queries/B_[slug].yaml`
- [ ] 2.N — [repeat for each additional dataset]
- [ ] 2.X — Record edition/version ID for every dataset in `notes.md`

**CHECKPOINT B**: every `output/*.csv` has a matching `queries/*.yaml` and a passed
double-check entry in `notes.md`.

---

## Phase 3 — Inspection and transformations

- [ ] 3.1 [P] — Inspect `output/A_[slug].csv`: rows, columns, flags, missing values
- [ ] 3.2 [P] — Inspect `output/B_[slug].csv`
- [ ] 3.3 — Document every transformation in `notes.md` and plan `.transform` block content
- [ ] 3.4 — Verify that transformed data supports the visualisation plan in `data-design.md`

---

## Cross-check gate (SJ-5)

- [ ] SJ-5 — Run `/sj.check` → record cross-check report in `notes.md`
- [ ] SJ-5a — All Block A checks PASS (or FAIL with agreed remediation)
- [ ] SJ-5b — All Block B checks PASS (or FAIL with agreed remediation)
- [ ] SJ-5c — All Block C checks PASS (or FAIL with agreed remediation)
- [ ] SJ-5d — C3 result recorded (LIKELY REJECT / LIKELY FAIL TO REJECT / AMBIGUOUS)

**CHECKPOINT C**: cross-check report complete with no unresolved FAILs.
Do not build charts until this checkpoint passes.

---

## Phase 4 — Visualisations

- [ ] 4.1 [P] — Build chart for Dataset A section (type from `data-design.md`, Chart.js)
- [ ] 4.2 [P] — Build chart for Dataset B section
- [ ] 4.N [P] — [repeat for each additional dataset section]
- [ ] 4.W — Verify no `<img>` tags used for charts — all charts are `<canvas>` (Chart.js)
           or `<svg>` (D3) with tooltips
- [ ] 4.X — Verify all charts render without console errors in browser
- [ ] 4.Y — Verify all axis labels are UPPERCASE and units are present
- [ ] 4.Z — Verify Y-axis for absolute-value charts: `min: 0` explicitly set in Chart.js
           config (not relying on library default)
- [ ] 4.AA — Verify `Chart.defaults.font.family` and `Chart.defaults.font.size` set globally
            at top of script block (not repeated per-chart)

---

## Phase 5 — Publication page

- [ ] 5.1 — Write HTML sections for each dataset (section-label, subtitle, chart-wrap,
           transform, note)
- [ ] 5.2 — Configure `initShell()` — check all `_en` variants if bilingual toggle is active
- [ ] 5.3 — Verify sticky nav links resolve to correct section IDs
- [ ] 5.4 — Verify generation date in three places (header, raw data callout, footer)
- [ ] 5.5 — Update `reports.json` with new entry
- [ ] 5.6 — Verify `<html lang="en">` (or language declared in `story-brief.md`)
- [ ] 5.7 — Add `story-brief.md` and `data-design.md` to Methodology files table

---

## Phase 6 — Accountability

- [ ] 6.1 — `notes.md` contains all phases with exact commands and dates
- [ ] 6.2 — Every dataset section has `.transform` block
- [ ] 6.3 — Every dataset section has `.note` block with source link and chart library link
- [ ] 6.4 — Methodology: each dataset has clickable `<a href>` to provider dataset page
- [ ] 6.4b — Methodology: each dataset links to `output/*.csv` for download; folder path present
- [ ] 6.5 — Double-check PASS blocks in Methodology for every dataset
- [ ] 6.6 — Raw data section: CSV links, rows, period, extraction date, licence

---

## Phase 7 — Executive summary

- [ ] 7.1 — Run pattern inventory (temporal, cross-entity, surprise) → record in `notes.md`
- [ ] 7.2 — Write 3–4 paragraph executive summary in `introExtra`
- [ ] 7.3 — Verify every claim cites an exact value with year traceable to `output/`
- [ ] 7.4 — Verify every cited section has a working `<a href="#section-id">` link
- [ ] 7.5 — **Verify the summary answers `story-brief.md` journalistic angle**
  - If null hypothesis not rejected: add explicit disclosure block (see executive-summary.md)

---

## Pre-publication checklist (final gate)

Run the full checklist in `accountability.md` before marking the analysis complete.

- [ ] SpecJournalism gates (story-brief.md, data-design.md, null hypothesis, method drift)
- [ ] Data and reproducibility (queries, metadata, double-check, edition IDs, reports.json)
- [ ] HTML and charts (no errors, no img, tooltips, uppercase, Y-axis anchoring, font defaults)
- [ ] Text and accountability (research question, proxy, transform blocks, dates, links)
