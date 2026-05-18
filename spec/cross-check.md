# SpecJournalism — Phase SJ-5: Cross-Check

## Purpose

Verify cross-artifact consistency after Phase 3 (data inspection) and before
Phase 4 (visualisations). This is a read-only gate: it does not change any files.
It identifies misalignments between the Story Brief, the Data Design, the downloaded data,
and the planned visualisations — before they become published errors.

Run `/sj.check` after completing Phase 3 and before starting Phase 4.

---

## Instructions

### Step 1 — Load artefacts

Load in order:
1. `reports/NN_slug/story-brief.md`
2. `reports/NN_slug/data-design.md`
3. `reports/NN_slug/notes.md` (Phase 3 entries: inspection and transformations)
4. List all files in `reports/NN_slug/output/`

### Step 2 — Run consistency checks

Execute all checks below. Record PASS or FAIL with a one-line explanation for each.

#### Block A — Brief → Data coverage

**A1. Research question coverage**
Does at least one downloaded dataset directly measure the phenomenon described in the
`journalistic_angle` section of `story-brief.md`?
- PASS: a dataset measures the phenomenon directly or via an explicit proxy documented in `notes.md`
- FAIL: all datasets are indirect proxies, or none cover the geographic/temporal scope of the brief

**A2. Null hypothesis testability**
Can the downloaded data be used to test the falsifiability condition in `story-brief.md`?
- PASS: the data contains the variable, entities and time range needed to evaluate the methodological floor
- FAIL: the data is insufficient to evaluate the null hypothesis as stated

**A3. Scope consistency**
Does the downloaded data match the geographic scope and time period defined in `story-brief.md` (Clarifications section)?
- PASS: entities and period in `output/*.csv` match the clarified scope
- FAIL: significant entities are missing, the period is shorter than stated, or the unit does not match

#### Block B — Data Design → Downloaded Data

**B1. Dataflow match**
Does every dataset in `data-design.md` have a corresponding file in `output/`?
- PASS: every Dataset A, B, C… has a matching `output/*.csv`
- FAIL: one or more planned datasets are missing from `output/`

**B2. Filter match**
Do the filters applied during download (recorded in `notes.md`) match the filters specified
in `data-design.md`?
- PASS: dimensions, values and ranges match
- FAIL: a filter was changed during download without a version update to `data-design.md`

**B3. Visualisation feasibility**
For each chart in the visualisation plan, does the downloaded data support the planned chart type?
- PASS: data shape, value range, and entity count are compatible with the planned chart type
- FAIL examples: fewer than 3 time points for a line chart; missing entities expected in a ranking;
  data range makes the chart unreadable at planned dimensions

**B3b. Visual honesty — Y-axis and chart format**
For each chart showing absolute values (counts, persons, expenditure):
- Is `scales.x.min: 0` (horizontal bar) or `scales.y.min: 0` (line/bar) explicitly set in
  the planned Chart.js config? (Not a library default — explicit.)
- Are all charts planned as Chart.js canvas or D3 SVG? (No `<img>` tags.)
- PASS: Y min = 0 confirmed in planned config; no static image charts
- FAIL: Y axis not explicitly anchored at zero; or any chart planned as `<img>`

#### Block C — Data → Narrative plan

**C1. Finding cards feasibility**
Can the 4 finding cards (implied by the Story Brief or data-design.md) be derived from
actual values in `output/*.csv`?
- PASS: every planned card value is traceable to a specific row in a specific output file
- FAIL: a planned card requires a calculation that the downloaded data does not support

**C2. Executive summary pre-check**
Does the inspected data contain enough material to answer the journalistic angle with at
least two of the three pattern types required by Phase 7 (temporal, cross-entity, surprise)?
- PASS: at least two pattern types are present in the data
- FAIL: the data only supports a single-dimension description

**C3. Null hypothesis result (preliminary)**
Based on Phase 3 inspection, what is the preliminary direction relative to the null hypothesis?
- `LIKELY REJECT`: data appears to show an effect above the methodological floor
- `LIKELY FAIL TO REJECT`: data appears to show no effect above the floor
- `AMBIGUOUS`: effect exists but magnitude is unclear pending full analysis

This is not a final verdict — it is a flag to anticipate the outcome before investing
in chart construction and narrative writing.

---

## Cross-check report template

Record in `notes.md` after the Phase 3 entries:

```markdown
## [DATE] — SJ-5 Cross-check

### Block A — Brief → Data coverage
- A1 Research question coverage: [PASS / FAIL] — [one-line explanation]
- A2 Null hypothesis testability: [PASS / FAIL] — [one-line explanation]
- A3 Scope consistency: [PASS / FAIL] — [one-line explanation]

### Block B — Data Design → Downloaded Data
- B1 Dataflow match: [PASS / FAIL] — [one-line explanation]
- B2 Filter match: [PASS / FAIL] — [one-line explanation]
- B3 Visualisation feasibility: [PASS / FAIL] — [one-line explanation]
- B3b Visual honesty (Y-axis + no img): [PASS / FAIL] — [one-line explanation]

### Block C — Data → Narrative plan
- C1 Finding cards feasibility: [PASS / FAIL] — [one-line explanation]
- C2 Executive summary pre-check: [PASS / FAIL] — [one-line explanation]
- C3 Null hypothesis (preliminary): [LIKELY REJECT / LIKELY FAIL TO REJECT / AMBIGUOUS]

### Overall result
[ALL PASS → proceed to Phase 4]
[ONE OR MORE FAIL → list actions required before proceeding]

### Actions required
- [ ] [Specific action for each FAIL]
```

---

## Decision rules after cross-check

**All checks PASS**: proceed to Phase 4 (visualisations).

**A1 or A2 FAIL**: stop. Return to `story-brief.md`. Options: pause the story, or amend
the brief with user agreement and a version note.

**A3 FAIL**: verify whether missing scope is recoverable (different dataflow, different provider).
If not, update scope in `story-brief.md` and add a Scope Limit callout.

**B1 FAIL**: download the missing dataset before proceeding.

**B2 FAIL**: update `data-design.md` to reflect the actual filters used, with a version note.
If the change affects the null hypothesis test, revisit `null-hypothesis.md`.

**B3 FAIL**: update the visualisation plan in `data-design.md` to use a compatible chart type.
Record the change as a version note.

**B3b FAIL**: fix before proceeding to Phase 4. Set `min: 0` explicitly in the Chart.js
config for all absolute-value charts. Remove any planned `<img>` chart and replace with a
Chart.js canvas or D3 SVG with tooltips.

**C1 FAIL**: identify which finding card cannot be supported and remove or replace it.

**C2 FAIL**: the executive summary will cover fewer pattern types. Note in `notes.md`.
Adjust Phase 7 accordingly.

**C3 = LIKELY FAIL TO REJECT**: discuss with user before proceeding. Options: pause,
reframe as a null-result story, or scope down to a subset. Record the decision in `notes.md`.
