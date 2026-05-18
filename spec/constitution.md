# JournAI — Constitution

Load this file first, before any other phase. Check it before every decision.
These rules are immutable. They are not defaults. They cannot be overridden by
a Story Brief, a data-design plan, a user instruction, or a convenience argument.

---

## Article 1 — The brief precedes the data

Never search for datasets before a Story Brief (`story-brief.md`) exists and is complete.
Never redefine the journalistic question to fit available data.
If the data does not answer the brief, the story is paused — not reframed.

## Article 2 — Falsifiability is mandatory

Every Story Brief must contain an explicit Null Hypothesis section before entering
the technical execution pipeline. A story without a stated falsifiability condition is not ready
to be analysed.

## Article 3 — Methodological choices are pre-registered

The data-design plan must be written and approved before downloading any data.
Do not select the statistical method or chart type after seeing the results.
If the pre-registered method does not produce a publishable result, document that
in `notes.md` and report it in the Scope Limit callout. Do not switch methods silently.

## Article 4 — Causation is never implied by correlation

Never use language that implies causality unless the methodology explicitly supports it
(e.g. difference-in-differences, instrumental variables, regression discontinuity).
Use precise language: "associated with", "coincides with", "follows", "precedes".
Never: "causes", "drives", "is responsible for", "leads to" — unless the method warrants it.

## Article 5 — Scope limits are about series, not providers

Never write "[Provider] does not cover X". The correct formulation is always
"this series/dataset does not cover X". A provider may have dedicated datasets
for what the chosen series omits. Only claim a provider does not cover a phenomenon
after searching the provider's full catalogue.

## Article 6 — Every number has a source

Every quantitative claim in the narrative, executive summary, finding cards and
chart labels must be directly traceable to a row in a CSV file in `output/`.
No values from memory. No approximations without explicit disclosure.
If a number cannot be traced to `output/`, it cannot appear in the report.

## Article 7 — Visual honesty is non-negotiable

- Absolute values (counts, expenditure, persons): Y-axis must start at zero. No exceptions.
- Rates, percentages, indices: auto-scaled range is acceptable; add an explicit note in `.note`
  explaining why zero is not shown (e.g. "The Y-axis is auto-scaled to the data range —
  starting at zero would compress the meaningful variation without adding information").
- Never add synthetic data points to force a baseline. A point that does not exist in
  `output/` is fabricated data.
- Never use a chart type that implies cumulation for non-cumulative data.
- Never use dual Y-axes without written justification in `data-design.md`.
- All axis labels uppercase. Unit of measurement always present.
- Static image charts (`<img>`) are **forbidden**. Every chart must be rendered as interactive
  SVG or via a JavaScript charting library. Tooltips must be present so users can inspect
  individual data points.

## Article 8 — Reproducibility is a minimum condition, not a bonus

Every analysis must be fully reproducible from the repository alone:
- `queries/*.yaml` files must exist for every `output/*.csv`
- `notes.md` must record every command run, in order, with exact parameters and date
- `metadata/` must contain codelists for every filtered or visualised dimension
- Every dataset in the Methodology section must link to the provider's dataset page as a
  clickable `<a href>` — plain text dataset IDs are not sufficient
  (Eurostat format: `https://ec.europa.eu/eurostat/databrowser/view/DATASET_ID/default/table`)
- Every dataset must link to its corresponding `output/*.csv` for direct download
- The report folder path must appear in the Methodology section
- Every dataset extraction must pass the double-check rule (two independent runs)

## Article 9 — The story brief survives tool switching

`story-brief.md` is the contract between the journalist and the analysis.
It is version-controlled. It does not belong to any specific AI model or tool.
If the orchestrator changes (Claude → Gemini → GPT), the brief is loaded first.
The brief ensures continuity. Do not let it drift.

## Article 10 — The executive summary answers the brief, not the data

The narrative executive summary must answer the research question stated in `story-brief.md`.
It must not be a description of what the data happened to show.
If the data partially answers the brief, say so explicitly in the summary.
If the data does not answer the brief, the summary must say so — and explain why.

## Article 11 — English is the default output language

All reports are written in English unless the Story Brief explicitly requests a different
language. This covers: HTML `lang` attribute, all narrative text, section titles, callouts,
axis labels, methodology text, finding cards, and footer.
A language switch requires an explicit user instruction recorded in `story-brief.md` before
any HTML is generated. Without that instruction, English is mandatory.
The bilingual ENG|ITA toggle infrastructure in the shell remains available but is opt-in,
not the default.

---

## Derived visual rules (from Article 7)

These rules apply to every chart in every report. Check them at Phase 4 and in SJ-5.

**Default library: Chart.js.** Use it for all standard chart types: line, bar (vertical and
horizontal), scatter, doughnut. Do not use roughViz, chart.xkcd, or matplotlib.

**Second library: D3.js.** Use it only when Chart.js cannot produce the required output:
custom layouts, maps, network graphs, complex interactivity. Document the reason for choosing
D3 in `data-design.md` before building the chart.

No other charting libraries are permitted without explicit justification in `data-design.md`.

**Chart.js rules:**
- Container: always `<canvas>`. Never `<div>` or `<svg>` for Chart.js charts.
- Set `maintainAspectRatio: false` and control height via the parent wrapper element.
- Set `Chart.defaults.font.family` and `Chart.defaults.font.size` globally at the top of
  the script — do not repeat font config on individual axes.
- Horizontal bar charts: use `type: 'bar'` with `indexAxis: 'y'`.
- For absolute-value charts: set `scales.x.min: 0` (or `scales.y.min: 0`) explicitly in
  the chart configuration — do not rely on library defaults.
- Tooltips: always enabled. At minimum show the value and the entity label.
- All text visible in charts (axis titles, tick labels, legend labels, tooltip strings) must
  be uppercase.

**D3 rules:**
- Container: always `<svg>`. Manage width and height via the parent wrapper, not inline SVG
  attributes.
- Width must be measured from the chart's direct container at render time, accounting for
  padding via `getComputedStyle`.

**Colour palette:**

```
Red   (primary series):  #b02020   hover: #c0392b
Blue  (secondary series): #1a6fa8  hover: #2980b9
Green:  #27ae60
Orange: #e67e22
Purple: #8e44ad
Teal:   #16a085
```

Do not introduce new colours without documenting them in `data-design.md`.

---

## Derived accountability rules (from Article 8)

These rules apply throughout the pipeline. Check them at Phase 6.

- Every transformation is documented in `notes.md` and in the `.transform` block on the page
- Edition or version ID for every dataset is recorded in `notes.md` and cited in `.transform`
- Double-check result (MATCH ✓ / DIVERGENCE ✗) is recorded in `notes.md` and in the Methodology section
- Generation date appears in three places: header eyebrow, Raw data callout, footer —
  format `DD Month YYYY` (e.g. `18 May 2026`) — never ISO format, never month-only
- `introExtra` (executive summary) is written last, after all sections and charts are verified
- Methodology section must include: (1) clickable source URL per dataset, (2) download link
  to each `output/*.csv`, (3) report folder path
