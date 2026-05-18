# SpecJournalism — Phase 6: Accountability

## Purpose

Every analysis must be verifiable step-by-step by anyone. This requires consistent
documentation in `notes.md` and in the HTML page, and a passed pre-publication checklist.

---

## In `notes.md` (chronological log)

Structure `notes.md` with dated entries for each phase:

```markdown
# Notes — [ANALYSIS TITLE]

## [DATE] — SJ-0: Constitution loaded
- Loaded spec/constitution.md — confirmed current version

## [DATE] — SJ-1: Story Brief
- Produced story-brief.md v1.0
- Journalistic angle: [one line]
- Editorial hook: [one line]

## [DATE] — SJ-2: Clarifications
- Q1 Geographic scope: [answer]
- Q2 Time period: [answer]
- Q3 Comparison baseline: [answer]
- Q4 Unit of analysis: [answer]
- Q5 Audience calibration: [answer]

## [DATE] — SJ-3: Null hypothesis
- Falsifiability condition: [sentence]
- Methodological floor: [threshold]
- Scope trigger: [paused / reframed / scoped down]

## [DATE] — SJ-4: Data Design
- Produced data-design.md v1.0
- Datasets planned: [list]
- Visualisation plan: [summary]

## [DATE] — Phase 0: Research question
- Cleaned question: [text]
- Statistical proxy: [text]

## [DATE] — Phase 1: Dataset search
- Command: opensdmx providers → [N providers listed]
- Command: opensdmx search "[keyword]" --provider [id] → [datasets found]
- Selected: [DATASET_ID] because [reason]
- Excluded: [DATASET_ID] because [reason]

## [DATE] — Phase 2: Dimensions and metadata
- opensdmx info [DATASET_ID] --provider [id] → [dimensions found]
- Dimension [X] = [value] because [reason]
- Metadata saved: metadata/A_slug-meta.csv

## [DATE] — Phase 2: Download
- Command: opensdmx get "[DATASET_ID]" ... --out output/A_slug.csv
- Output: [N rows], [N entities], [period]
- Edition ID: [ID]
- Anomalies: [flags, missing values, or "none"]

## Double check — [DATASET_ID]
- Run 1 (opensdmx get): [N rows], [sample value]
- Run 2 (direct URL / alternative): [N rows], [sample value]
- Result: MATCH ✓ / DIVERGENCE ✗ — [explanation if divergence]

## [DATE] — Phase 3: Inspection
- Columns: [list]
- Key dimensions unique values: [summary]
- OBS_FLAG values: [p/b/d counts, or "none"]
- Missing: [countries or years absent]

## [DATE] — Phase 4: Transformations — Dataset A
- Raw: [X rows, Y countries, YYYY–YYYY]
- [operation 1]
- [operation 2]
- Final: [Z observations]

## [DATE] — SJ-5 Cross-check
[Cross-check report — see cross-check.md]

## [DATE] — Phase 4: Charts
- Dataset A: [chart type] via Chart.js because [reason]
- Dataset B: [chart type] via Chart.js because [reason]

## [DATE] — Phase 7: Patterns for executive summary
- Temporal: [description + value with year]
- Country: [range + outlier]
- Surprise: [finding with two values from different sections]
```

---

## In the HTML page

Each dataset section must have:

| Element | Required content |
|---|---|
| `.section-label` | Provider · Dataset ID · key dimension |
| `.subtitle` | Unit of measurement · filters · coverage |
| `.transform` | Raw rows + every operation applied + final count |
| `.note` | Reading instructions + anomalies + source link + chart library link |
| Methodology section | Clickable `<a href>` to provider dataset page + API URL or CLI command |
| Raw data section | CSV download link + rows + period + extraction date + licence |

---

## What NOT to do

- Never edit CSVs in `output/` by hand
- Never omit the `.transform` block, even if trivial ("No transformations applied — raw data used directly")
- Never use interpolated data without declaring it explicitly
- Never publish API URLs without having clicked and verified them
- Never choose a chart type that distorts perception (e.g. line chart with fewer than 3 points)
- **Never truncate the Y-axis on absolute values** — expenditure, counts, and other absolute
  series must have Y starting at zero; `min: 0` must be explicit in the Chart.js config
- **Never add synthetic data points to force a zero baseline** — a point that does not exist
  in `output/` is fabricated data
- **Never write "[Provider] does not cover X"** without having searched the full catalogue —
  the correct formulation is "this series/dataset does not cover X"
- **Never use `<img>` for charts** — every chart must be a Chart.js canvas or D3 SVG with
  interactive tooltips

---

## Pre-publication checklist

### SpecJournalism gates
- [ ] `story-brief.md` exists, is version-controlled, and its `journalistic_angle` is unchanged
  from the `researchQuestion` in `initShell()`
- [ ] `data-design.md` exists, is version-controlled, and matches the analysis as built
  (no silent method changes after data download)
- [ ] `Null hypothesis` section in `story-brief.md` is filled with a pre-registration date
  that predates any file in `output/`
- [ ] Executive summary (Phase 7) answers `story-brief.md` journalistic angle — not just
  describes data
- [ ] If C3 was LIKELY FAIL TO REJECT: the null result is disclosed in the Scope Limit callout
- [ ] Every change to `data-design.md` after data download is documented with a version note
  and a reason

### Data and reproducibility
- [ ] Every CSV in `output/` has a matching YAML in `queries/`
- [ ] Every filtered or visualised dimension has a codelist in `metadata/`
- [ ] Every dataset extraction has a Double check MATCH ✓ in `notes.md`
- [ ] Edition/version ID recorded in `notes.md` and in `.transform` block; confirmed as the
  latest available before publishing
- [ ] `reports.json` updated with the new entry

### HTML and charts
- [ ] Page opens without JavaScript console errors
- [ ] All charts render correctly in the browser (test in Chrome and Firefox)
- [ ] All charts use `<canvas>` (Chart.js) or `<svg>` (D3) — no `<img>` charts
- [ ] All charts have working tooltips
- [ ] All axis labels are UPPERCASE and include the unit of measurement
- [ ] For absolute-value charts: `min: 0` explicitly set in Chart.js config (not relying on default)
- [ ] For rate/percentage charts: a `.note` sentence explains why Y-axis does not start at zero
- [ ] `Chart.defaults.font.family` and `Chart.defaults.font.size` set globally, not per-axis
- [ ] All `↓ CSV` download links work locally

### Text and accountability
- [ ] `researchQuestion` in `initShell()` matches the cleaned version in `notes.md`; scope
  and intent unchanged from `story-brief.md`
- [ ] `statisticalProxy` field filled and explains why the indicator approximates the question
- [ ] `.transform` block present in every dataset section (even if no transformations applied)
- [ ] Generation date in `DD Month YYYY` format in all three places: `initShell({ date })`,
  Raw data callout, footer
- [ ] Raw data section states extraction date and licence
- [ ] Scope Limit callout refers to **this specific series/dataflow**, not to the provider
- [ ] Every `[URL...]` placeholder replaced with a real, verified, clickable link
- [ ] Eurostat dataset page links use format:
  `https://ec.europa.eu/eurostat/databrowser/view/DATASET_ID/default/table`
- [ ] Eurostat API URLs in Methodology section return data when clicked in a browser
- [ ] Report folder path appears in Methodology section
- [ ] `story-brief.md` and `data-design.md` are listed in the Methodology files table
