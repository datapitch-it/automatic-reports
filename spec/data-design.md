# SpecJournalism — Phase SJ-4: Data Design

## Purpose

Produce `reports/NN_slug/data-design.md`: the methodological plan for the analysis.
This is the bridge between the journalistic intent (`story-brief.md`) and the
technical execution pipeline.

Data Design answers: which data, from which sources, with which method, displayed how.
It must be complete before any data is acquired.

---

## Instructions

### Step 1 — Load context

Load in order:
1. `spec/constitution.md` — verify rules are active
2. `reports/NN_slug/story-brief.md` — read angle, scope, clarifications, null hypothesis

### Step 2 — Propose candidate sources and datasets

Two skills are available to assist dataset discovery before committing to a source:

- **`sdmx-explorer`** — for structured statistical data (Eurostat, ISTAT, OECD, ECB, World Bank).
  Use when the phenomenon is a standard statistical indicator: GDP, unemployment, population,
  prices, fertility, energy, trade, etc.
- **`ckan-mcp`** — for open government data portals (~950 CKAN instances, plus data.europa.eu).
  Use when the source is likely a national or regional open data portal, or when the dataset
  type is not a standard statistical series.

Invoke the appropriate skill to search and validate candidate datasets before completing
this step. Do not assume dataset IDs are correct without verification.

Based on the Story Brief scope (phenomenon, geography, time period), propose:
- 2–3 candidate data sources likely to contain the phenomenon
- For each source: 1–2 candidate dataset IDs or names

Format the proposal as:

```
Candidate sources and datasets for: [brief title]

Source: [provider name]
- [DATASET_ID]: [description] — likely covers [phenomenon aspect]
- [DATASET_ID]: [description] — alternative if first is unavailable

Recommended starting point: [source + dataset] because [reason tied to the brief scope].
Proceed to verify dataset availability?
```

Wait for user confirmation before committing to a source/dataset pair.

### Step 3 — Define the analytical method

Based on the null hypothesis and methodological floor in `story-brief.md`, specify:

**For trend analyses:**
- Time range (start year, end year or "most recent available")
- Whether a structural break year should be identified or annotated
- Whether the trend is described as absolute change, percentage change, or index

**For comparison analyses:**
- The set of entities to compare (country list, or rule for inclusion)
- The reference baseline (EU average, specific country, sector average)
- The metric for comparison (value in most recent year, average over period, ratio)

**For correlation analyses:**
- The two variables and their respective dataflows
- The level of aggregation (national, regional, sectoral)
- Whether the correlation is cross-sectional (one year) or panel (multiple years)

**For policy evaluation analyses:**
- The policy and its implementation date
- The outcome indicator and its dataflow
- The comparison strategy (pre/post for treated entity, treated vs. control group)

### Step 4 — Plan the visualisations

For each dataset section planned, specify:

| Section | Dataset | Chart type | Library | Entities shown | Period | Key dimension |
|---|---|---|---|---|---|---|
| [label] | [DATAFLOW_ID] | Horizontal bar / Line / Bar / Scatter | Chart.js / D3 | [N entities] | [YYYY–YYYY] | [dimension] |

Rules:
- **Default library: Chart.js.** Use D3 only when Chart.js cannot produce the required output.
  If D3 is chosen, record the justification here (e.g. "requires geographic map projection").
- Do not choose a chart type without verifying the data shape supports it.
- If the data contains negative values, note it here — horizontal bar charts require
  special handling (Chart.js clips bars correctly, but verify with actual data range).
- If the time series has fewer than 4 data points, prefer a bar chart over a line chart.
- If dual Y-axes are planned, record the justification here (Constitution Article 7).
- No `<img>` charts. Every chart must be a Chart.js canvas or D3 SVG with tooltips.

### Step 5 — Anticipate data quality risks

For each planned dataset, record:
- Known coverage gaps (countries typically missing, years with provisional data)
- Likely flag issues (`OBS_FLAG = p` for provisional, `b` for series break)
- Revision risk (datasets revised annually — check edition ID before publishing)
- Granularity mismatch (if one dataset is annual and another quarterly, note aggregation strategy)

---

## data-design.md template

```markdown
# Data Design — [Analysis title]
Linked to: story-brief.md v[X.X] dated [DATE]

## Methodological approach
[2–3 sentences. What analytical strategy is used to answer the Story Brief.
Derived directly from the null hypothesis and methodological floor.]

## Datasets

### Dataset A — [Label]
- Source: [provider name]
- Dataset ID: [ID or name]
- Dimensions / filters: [list with chosen values]
- Time range: [YYYY–YYYY]
- Geographic scope: [list or rule]
- Unit: [unit of measurement]
- Output file: output/A_[slug].csv
- Query file: queries/A_[slug].yaml
- Covers: [which aspect of the Story Brief this dataset answers]

### Dataset B — [Label]
[same structure]

## Visualisation plan

| Section ID | Dataset | Chart type | Library | Note |
|---|---|---|---|---|
| [id] | A | Horizontal bar | Chart.js | Ranking, most recent year |
| [id] | B | Line | Chart.js | Time series 2000–2024 |

## Data quality risks
- [Dataset A]: [known risk]
- [Dataset B]: [known risk]

## Methodological commitments
[List of pre-registered choices that cannot be changed after data download without
documenting the change in notes.md.]
- Method: [chosen method]
- Threshold: [from methodological floor]
- Baseline: [reference entity or value]

## Version history
- [DATE] v1.0 — initial design
```

---

## Handoff to technical execution pipeline

Once `data-design.md` is complete and approved, hand off to the execution pipeline Phase 1.

**Constraints passed to the execution pipeline:**
- Phase 0 (research question): use the `journalistic_angle` from `story-brief.md` as the
  source for the cleaned research question. Do not rewrite the scope.
- Phase 1 (dataset search): start from the source and dataset IDs in `data-design.md`.
  Verify availability via `sdmx-pipeline.md` Phase 1 commands — do not assume they are correct.
- Phase 2 (acquisition): use the filters defined in `data-design.md`. If filters produce
  no data or fewer rows than expected, record the discrepancy in `notes.md` and consult
  the user before changing them.
- Phase 3 (inspection): if the data shape contradicts the visualisation plan in
  `data-design.md`, update `data-design.md` with a version note before changing the plan.

---

## Output check before entering Phase 1

- [ ] `data-design.md` exists in `reports/NN_slug/`
- [ ] Every dataset section has provider, dataflow ID, filters, time range, output file name
- [ ] Visualisation plan covers every dataset section (no dataset without a planned chart)
- [ ] Library choice is Chart.js for each chart, or D3 with documented justification
- [ ] Methodological commitments are recorded and derived from `null-hypothesis.md`
- [ ] Data quality risks are listed for every dataset
- [ ] `story-brief.md` version referenced in `data-design.md` header matches current version
- [ ] No data has been acquired yet (only dataset verification/inspection allowed in this phase)
