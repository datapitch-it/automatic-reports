# JournAI — Methodology for SDMX data analysis with AI

## Purpose

This document describes the working method for producing analyses of institutional statistical
data (SDMX format), starting from a research question and ending with a self-contained HTML page,
readable by anyone, with all steps documented and reproducible.

**Stack**: opensdmx CLI · Bootstrap 5 · roughViz 1.0.6 · chart.xkcd 1.1

---

## Folder structure

Each analysis lives in its own folder inside `reports/`.
The folder name is a two-digit sequential number + descriptive slug.

```
/
├── assets/
│   ├── style.css           ← CSS shared by all reports
│   └── shell.js            ← initShell() function
├── index.html              ← catalogue (reads reports.json via fetch)
├── reports.json            ← report manifest
└── reports/
    └── 01_slug-del-tema/
        ├── index.html      ← analytical page (~360 lines: dataset sections + initShell config)
        ├── output/         ← CSVs downloaded from API, never edited by hand
        │   ├── A_nome.csv
        │   ├── B_nome.csv
        │   └── ...
        ├── metadata/       ← codelists and metadata downloaded with opensdmx
        ├── queries/        ← YAML files with reproducible queries
        │   ├── A_nome.yaml
        │   └── ...
        └── notes.md        ← chronological log of operations (see Accountability section)
    └── 02_slug-del-tema/
        ...
```

**Rule**: everything needed to reproduce the analysis must be in the repository.
`index.html` depends on `../../assets/` (shared CSS and JS, in the repo) and on CDNs for
Bootstrap, roughViz and chart.xkcd. Do not depend on files outside the repository.

---

## Phase 0 — Report language

**Default: ENG | ITA (bilingual).** Do not ask the user about language unless they explicitly request a single-language report. The standard output is always a bilingual page using the `<span class="en">` / `<span class="it">` toggle pattern already in the shell.

The bilingual default applies to:
- all text in the `index.html` page (titles, descriptions, callouts, notes, chart labels) — every user-visible string must have both an `.en` and an `.it` variant
- `notes.md` may be written in Italian (working language of the analyst)
- file names are not affected (they remain in English/slug form)

SDMX codes, variable names, CLI commands and API URLs always remain in English
regardless of language.

### Two-layer bilingual system — MANDATORY

**Layer 1 — `initShell()` config fields**: the shell renders the header, intro, nav, finding cards, raw data section and footer from the JS config. Every text field must have a separate `_en` variant. The `t(en, it)` function in shell.js reads these at render time (called again on toggle). Without `_en`/`_it` pairs, clicking ENG↔ITA has no effect on shell-rendered content.

| Config field | Italian (default) | English variant |
|---|---|---|
| `title` | Italian title | `title_en` |
| `date` | "6 maggio 2026" | `date_en: "6 May 2026"` |
| `intro` | Italian text | `intro_en` |
| `introTitle` | Italian | `introTitle_en` |
| `introSubtitle` | Italian | `introSubtitle_en` |
| `scopeLimit` | Italian | `scopeLimit_en` |
| `findingCards[].label` | Italian | `label_en` |
| `nav[].label` | Italian | `label_en` |
| `rawData.files[].desc` | Italian | `desc_en` |
| `methodology.classifications[].meaning` | Italian | `meaning_en` |

**Layer 2 — static HTML sections** (inside `<main>`): use inline `<span class="en">` / `<span class="it">` pairs. The CSS shows/hides these automatically when `body.lang-it` is toggled. Do not put English-only or Italian-only plain text in static sections — always wrap in a span pair.

---

## Phase 0 — Defining the research question

Before fixing the question, **propose a numbered list of possible research questions** derived
from the stated topic to the user. Example:

> Here are some possible research questions for this topic:
>
> 1. How has the female employment rate changed in Europe over the last 10 years?
> 2. Which EU countries have reduced the gender pay gap the most since 2010?
> 3. Is there a correlation between public spending on childcare and the female employment rate?
>
> Which one interests you, or would you like to start from a different question?

Wait for the user's choice. Only then, write down in `notes.md`:

```markdown
## Research question
### Original (verbatim)
[Exact words used by the user — do not paraphrase]

### Cleaned
[Same question, lightly corrected for grammar and punctuation — meaning and scope unchanged]

## Statistical proxy
[Which measurable quantity in SDMX approximates the phenomenon of interest, and why it is a good (or imperfect) proxy]

## Scope
[What THIS SPECIFIC SERIES/DATAFLOW does NOT cover — never generalise to the provider.
Write "this series does not cover X", never "[Provider] does not cover X".
Claiming a provider does not cover a phenomenon requires having searched the full catalogue (`opensdmx search`). A provider may have dedicated dataflows for exactly what the chosen series omits.]

## Candidate providers
[To be filled after running `opensdmx providers` — see Phase 1.1]
```

**Preservation rule**: the cleaned version is the one that goes into the HTML report (`researchQuestion` field of `initShell()`). It must not be rewritten as an analytical framing — only grammar and punctuation may change. The original verbatim version stays in `notes.md` only. This chain (original → cleaned → report) is what allows the reader to judge whether the data actually answers the question asked.

---

## Phase 1 — Dataset search with opensdmx

### 1.1 List available providers

> **This is the first mandatory command of every analysis.** The provider list
> changes with opensdmx updates: always run this check to get the current
> version; do not rely on static lists.

```bash
opensdmx --output json providers
```

Output: JSON array with `alias`, `name`, `agency_id`, `constraints_supported`, `last_n_supported`, `categories_supported`.

Record the candidate providers and their capabilities in `notes.md`, then fill in the
**Candidate providers** section in Phase 0 with the real output.

Key columns and what they imply:
- **`constraints_supported`**: if `false`, use `opensdmx values` instead of `opensdmx constraints` to explore valid codes.
- **`last_n_supported`**: if `false`, do not use `--last-n` in queries (e.g. World Bank).
- **`categories_supported`**: if `false`, skip `opensdmx tree` and use `opensdmx search` directly.

### 1.2 Search for datasets by keyword

```bash
opensdmx search "<keyword>" --provider <provider_id>
# examples:
opensdmx search "government expenditure" --provider estat
opensdmx search "defence" --provider oecd
```

Output: list of datasets with ID and description.
Search multiple keyword variants. Record all datasets found in `notes.md`
and the reason each one is included or excluded.

### 1.3 Get information about a dataset

```bash
opensdmx info <DATASET_ID> --provider <provider_id>
# example:
opensdmx info GOV_10A_EXP --provider estat
```

Output: description, available dimensions, periodicity, geographic coverage.

### 1.4 Explore dimensions and valid codes

```bash
opensdmx info <DATASET_ID> --provider <provider_id>
```

For every relevant dimension (one that is filtered or used as an axis/series in a chart),
it is **mandatory** to download the code table (codelist) into `metadata/`. This ensures
the report is consultable offline.

**Command to download metadata**:
Use the global `-o csv` option and shell redirection. Files must follow the same naming
scheme as files in `output/`, adding the suffix `-meta`.

```bash
opensdmx -o csv values <DATASET_ID> <DIMENSION_NAME> --provider <provider_id> > metadata/<QUERY_NAME>-meta.csv
# example:
# if the data file is output/A_spesa_militare.csv
opensdmx -o csv values GOV_10A_EXP cofog99 --provider eurostat > metadata/A_spesa_militare-meta.csv
```

**Record in `notes.md`**: for every dimension used, the chosen code and the reason. If a query
involves multiple critical dimensions, download several meta files following the schema
`[QUERY_NAME]-meta-[DIMENSION].csv`.

---

## Phase 2 — Data download

### 2.1 Query with explicit filters

```bash
opensdmx get "<DATASET_ID>" \
  --provider <provider_id> \
  --<DIMENSION_1> <value> \
  --<DIMENSION_2> <val1>+<val2>+<val3> \
  --start-period <YYYY> \
  --end-period <YYYY> \
  --out output/A_nome.csv
```

**Rules**:
- Multiple values for a dimension are separated with `+`
- Omitting a dimension = all available values
- Always use `--out` to save to `output/`
- The CSV file must never be edited by hand
- **Always record the edition ID**: every dataset has a publication edition (e.g. `2026M4G30` for ISTAT). Record it in `notes.md` and cite it in the `.transform` block on the page. Before publishing, verify that the edition used is the latest available — run the query again if in doubt.

Real example (Eurostat):

```bash
opensdmx get "GOV_10A_EXP" \
  --provider estat \
  --FREQ A \
  --unit PC_GDP \
  --sector S13 \
  --cofog99 GF0201 \
  --na_item TE \
  --start-period 2000 \
  --end-period 2024 \
  --out output/A_nome.csv
```

### 2.2 Direct API URL (Eurostat)

For Eurostat, every query corresponds to a publicly clickable URL:

```
https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/<DATASET_ID>/<FREQ>.<DIM2>.<DIM3>.<DIM4>.<DIM5>./<GEO>/?startPeriod=<YYYY>&endPeriod=<YYYY>&format=SDMX-CSV
```

The dimension order in the path follows the order returned by `opensdmx dimensions`.
**This URL must always be included in the HTML page under the Methodology section.**

For OECD the provider does not expose a direct public URL: document the CLI command instead.

### 2.3 Double check — repeat every extraction twice

**Mandatory rule**: every `opensdmx get` query must be run **twice independently** before using the data.

The second run must use an alternative approach to build the same query:
- first run: explicit filters via flags (`--geo NL --unit PC_GDP ...`)
- second run: direct Eurostat API URL (Phase 2.2) via `curl` or browser

Results are considered **validated** only if the row count, values and dimensions match. If they
diverge, investigate before proceeding (corrupted cache, ambiguous code, aggregate vs. individual).

Record in `notes.md`:

```markdown
## Double check — [DATASET_ID]
- Run 1 (opensdmx get): [N rows], [checksum or sample value]
- Run 2 (direct URL):   [N rows], [checksum or sample value]
- Result: MATCH ✓ / DIVERGENCE ✗ — [explanation if divergence]
```

In the HTML page, under the **Methodology** section, add for each validated dataset:

```html
<p class="note pt-2 mb-2">
  <strong>Double check passed</strong> — Data for <code>[DATASET_ID]</code> was
  extracted twice independently (opensdmx CLI + direct API URL) and results match:
  [N rows], period [YYYY–YYYY], [N entities].
</p>
```

### 2.4 Save the query as a reproducible YAML

```bash
opensdmx run <query_file.yaml> --out output/A_nome.csv
```

YAML file format:

```yaml
# queries/A_nome.yaml
provider: estat
dataset: GOV_10A_EXP
filters:
  FREQ: A
  unit: PC_GDP
  sector: S13
  cofog99: GF0201
  na_item: TE
  geo: ALL
start_period: "2000"
end_period: "2024"
format: SDMX-CSV
```

Always save the YAML in `queries/`. It is needed to regenerate the data in the future.

---

## Phase 3 — Inspection and transformations

### 3.1 Inspect the downloaded CSV

```bash
head -5 output/A_nome.csv
wc -l output/A_nome.csv
```

Record in `notes.md`:
- Number of rows
- Columns present and their meaning
- Unique values for key dimensions (countries, years, units)
- Presence of flags (`OBS_FLAG`): `p` = provisional, `d` = different definition, `b` = series break
- Missing data: absent countries or years

### 3.2 Document every transformation

For every transformation applied, record in `notes.md` (and then report in the HTML page):

```markdown
### Transformations — Dataset A
- Raw data: X rows, Y countries, years XXXX–XXXX
- [description of operation 1]: e.g. "selected the most recent available year per country"
- [description of operation 2]: e.g. "excluded country X because of anomalous value (accounting revision)"
- [description of operation 3]: e.g. "calculated base-100 index as (value_year/base_value)×100"
- Final data used in the chart: Z observations
```

**Transformations are embedded as inline data in the HTML** (JS arrays) —
not in separate CSV files. This ensures the page is self-contained.

---

## Phase 4 — Visualisations

### Available libraries

| Library | Supported chart types | Required container | When to use |
|---|---|---|---|
| roughViz 1.0.6 | BarH, Bar, Line, Scatter, Pie | `<div>` | Rankings, point-in-time comparisons |
| chart.xkcd 1.1 | XY, Bar, StackedBar, Pie, Radar | `<svg>` | Time series, multi-series |
| matplotlib (xkcd mode) | any type | `<img src="...">` | Python charts generated offline or in notebooks, exported as PNG/SVG |

**Key technical notes**:
- **roughViz 1.0.6**: Must point to a **`<div>`** container. The library creates the `<svg>` element internally. If pointed at an `<svg>`, rendering fails or produces overlaps.
- **chart.xkcd 1.1**: Must point to an **`<svg>`** element. If pointed at a `<div>`, it throws `Uncaught TypeError: e.node(...).getComputedTextLength is not a function`.
- `roughViz.Line` has a bug in the `d3.csv` callback (loses `this`): for time series use `chart.xkcd.XY` with inline data.
- `roughViz.BarH` and `roughViz.Bar` **do not support negative values**: the x-axis starts at 0 and a negative value produces `rect width < 0` with a console error. If data contains negative values, exclude those observations from the chart and document them in the `.note` and `.transform` blocks.

### Chart rules

- **Zero baseline — conditional rule**:
  - **Absolute values** (expenditure in €, number of persons, kg, km²): the Y-axis must always start at zero. A truncated scale on an absolute series is a visual distortion — never acceptable.
  - **Rates, percentages, indices** (unemployment rate, inflation, index numbers): if the data range does not naturally approach zero, do **not** force the axis to zero with synthetic data points. Use the auto-scaled range. Never add a fake point `{x: year, y: 0}` to force the baseline — a missing data point is not a methodology, it is fabricated data. Instead, in the `.note` block explicitly state that the Y-axis does not start at zero and why (e.g. "The Y-axis is auto-scaled to the data range — starting at zero would compress the meaningful variation without adding information"). If a truncated scale makes marginal variations look dramatic, the solution is a contextualising sentence in the callout, not a forced zero that distorts the other direction.

- **Minimum font 1rem**: always set `axisFontSize: '1rem'` and `titleFontSize: '1rem'` in every
  roughViz call. CSS cannot guarantee this limit because roughViz writes font-size
  as an inline style (`style="font-size: …"`) which takes precedence over any CSS rule without `!important`.
  The only reliable control point is the JS parameter.
- **UPPERCASE mandatory**: all axis labels (country names, categories, series) must be uppercase.
  In JavaScript: pass strings already uppercase (`'ITALY'`, `'25–34 YEARS'`, etc.)
  or use `.map(s => s.toUpperCase())` on the array.
- **Axis labels**: never omit axis labels (`xLabel`, `yLabel`). Always specify the unit of
  measurement (e.g. `"EURO"`, `"PERSONS"`, `"RATE PER 100K"`).
- **Label margin**: roughViz applies a fixed internal offset of ~10px between the label text
  and the axis (not modifiable via CSS — SVG text does not support `padding`). To compensate
  and give visual breathing room, always add **+10px** to `margin.left` (BarH) or
  `margin.bottom` (Bar) relative to the minimum value needed to contain the text.
  Practical rule: `left = longest_label_length_in_px + 10`.
  For BarH with ~10-character labels: `left: 160`; with ~15-character labels: `left: 190`.

- **Width from own container — MANDATORY**: every library that receives a width in pixels
  (roughViz, D3, Vega-Lite, etc.) must measure it from the chart's direct container at
  instantiation time — never from a shared value captured in advance or reused across charts.
  Use `getComputedStyle` to subtract the effective padding:
  ```javascript
  const wrap = document.querySelector('#chart-X').closest('.chart-wrap');
  const s    = window.getComputedStyle(wrap);
  const w    = Math.floor(wrap.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight));
  ```
  Also, the chart wrapper must not have `overflow-y: auto` or `overflow: auto`: SVG paths that
  overflow vertically beyond the SVG bounds (e.g. bars with extreme values, rough-fill paths)
  would generate a scrollbar that reduces the available width *after* the width has already been
  measured, causing clipping on the right side of the SVG. Explicitly set `overflow-y: hidden`
  on the wrapper.

### roughViz.BarH template (horizontal ranking)

```javascript
new roughViz.BarH({
  element: '#chart-[ID]',
  data: {
    labels: [/* array of UPPERCASE strings, ascending or descending order */],
    values: [/* array of numbers */]
  },
  title: '[Chart title]',
  titleFontSize: '1rem',
  axisFontSize: '1rem',
  roughness: 1.5,
  stroke: '#333',
  strokeWidth: 1,
  fillStyle: 'hachure',
  fillWeight: 0.7,
  color: '#c0392b',       /* red for primary series */
  highlight: '#e74c3c',
  tooltipStyles: 'background:#fff;border:1px solid #ccc;padding:4px 8px;font-size:1rem;',
  width: 900,
  height: /* proportional to number of bars: ~20px per bar + margins */,
  margin: { top: 40, right: 100, bottom: 30, left: 140 },
  xLabel: '[unit of measurement]',
});
```

### chart.xkcd.XY template (time series)

```javascript
// Data: array of points {x: year, y: value} — null values excluded
const anni = [2000, 2001, /* ... */];
const valori = [1.1, 1.2, /* null for missing years */];

const points = [];
anni.forEach((a, i) => {
  if (valori[i] !== null) points.push({ x: a, y: valori[i] });
});

new chartXkcd.XY(document.getElementById('chart-[ID]'), {
  xLabel: '',
  yLabel: '[unit]',
  data: {
    datasets: [{ label: '[series name]', data: points }]
  },
  options: {
    showLine: true,
    dotSize: 0.4,
    xTickCount: 4,
    yTickCount: 3,
    dataColors: ['#c0392b'],
  }
});
```

For small multiples (one chart per entity), use one `<svg id="chart-[CODE]">` for each
and iterate with `Object.entries(seriesData).forEach(...)`.

### matplotlib (xkcd mode) template

Use when the chart is generated in Python (notebook or offline script) and exported as a
static image. The file goes in `output/` and is referenced via `<img src="output/chart-name.png">`.

**UPPERCASE rule**: all labels (x-axis, y-axis, title, tick labels) must be uppercase.

```python
import matplotlib
matplotlib.use('Agg')          # non-interactive backend for export
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

with plt.xkcd():
    fig, ax = plt.subplots(figsize=(9, 4))

    # --- data ---
    anni  = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
    valori = [23.1, 24.0, 25.3, 26.1, 27.4, 25.0, 26.8, 28.2]

    ax.plot(anni, valori, color='#b02020', linewidth=2, marker='o', markersize=5)

    # --- UPPERCASE mandatory for all labels ---
    ax.set_xlabel('YEAR', fontsize=12)
    ax.set_ylabel('VALUE (%)', fontsize=12)
    ax.set_title('CHART TITLE', fontsize=14)

    # tick labels uppercase (if labels are strings)
    ax.set_xticks(anni)
    ax.set_xticklabels([str(a).upper() for a in anni], fontsize=10)

    # zero baseline — mandatory
    ax.set_ylim(bottom=0)

    # light grid
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter('%.1f'))
    ax.grid(axis='y', linestyle='--', alpha=0.4)

    plt.tight_layout()
    plt.savefig('output/chart-name.png', dpi=150, bbox_inches='tight')
    plt.close()
```

**Embedding in HTML**:

```html
<div class="chart-wrap mb-4">
  <p class="chart-title-label">CHART TITLE</p>
  <img src="output/chart-name.png" alt="CHART TITLE"
       style="width:100%; max-width:720px; display:block;">
</div>
```

**When to use vs roughViz / chart.xkcd**:

| Situation | Recommended library |
|---|---|
| Inline browser data, basic interactivity | roughViz or chart.xkcd |
| Existing Python script, data in CSV/DataFrame | **matplotlib xkcd** |
| Chart with complex layout (subplots, annotations) | **matplotlib xkcd** |
| Small multiples with many series | **matplotlib xkcd** |
| Entirely browser-based report, zero Python | roughViz / chart.xkcd |

### Colour palette

```
Red (primary series):    #b02020  highlight: #c0392b
Blue (secondary series): #1a6fa8  highlight: #2980b9
Green:  #27ae60
Orange: #e67e22
Purple: #8e44ad
Teal:   #16a085
```

---

## Phase 5 — Building the HTML page

### 5.1 Mandatory page structure

The `index.html` page must contain in order:

1. **Header** — title, description, badges with provider/period/countries
2. **Sticky nav** — links to all sections
3. **Intro section** — what is measured, why, scope limits, finding cards (4 key numbers)
4. **Section per dataset** — **Granularity rule**: each `output/*.csv` file downloaded must correspond exactly to one dedicated `<section>`. This ensures every produced query is actually analysed and visualised.
5. **Raw data section** — licence callout + download cards for each CSV
6. **Methodology section** — classifications, API URLs, CLI commands, available files
7. **Footer** — sources, tools, **generation date**

**Generation date rule**: the date must appear in **three places** on the page, always in the
format `DD Month YYYY` in the report language (e.g. `24 April 2026`):
- in the header eyebrow: `SDMX Research · [DD Month YYYY] · opensdmx CLI`
- in the Raw data section callout: `Extraction date: <strong>[DD Month YYYY]</strong>`
- in the last `<span>` of the footer

The date corresponds to the day the data was downloaded from the API. Do not use ISO format
(`2026-04-08`) or month without day (`April 2026`).

### 5.2 `index.html` template — structure with `initShell()`

Do not write CSS, nav, header, footer, intro section, raw data or methodology: these parts
are generated by `initShell()`. Write only the dataset sections and the JS config.

After each new report, update `reports.json` in the repository root with a new entry
(order, path, date, title, desc, badges). The `index.html` catalogue reads this file via
`fetch()` — no modification to the catalogue HTML is needed.

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITLE] — SDMX Research</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="../../assets/style.css">
  <script src="https://unpkg.com/rough-viz@1.0.6"></script>
  <script src="https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13/runtime.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.xkcd@1.1/dist/chart.xkcd.min.js"></script>
</head>
<body>

<!-- nav + header generated by initShell() -->
<div id="shell-top"></div>

<!-- intro (finding cards + scope) generated by initShell() -->
<div class="container">
<div id="shell-intro"></div>
</div>

<main class="container py-2">

  <!-- ═══ DATASET SECTIONS — written by AI ═══ -->

  <section class="section py-5" id="[id]">
    <p class="section-label mb-1">[Phase X] · [Provider] [Dataset ID] · [key dimension]</p>
    <h2 class="mb-2">[Descriptive chart title]</h2>
    <p class="subtitle mb-4">[Unit] · [filters] · [N entities]</p>
    <!-- optional callout, "how to read" note, chart-wrap, transform: written by AI -->
    <div class="chart-wrap mb-4">
      <div id="chart-[id]"></div>   <!-- or <svg> for chart.xkcd -->
    </div>
    <div class="transform p-3 mb-4">...</div>
  </section>

  <!-- ═══ END DATASET SECTIONS ═══ -->

</main>

<!-- raw data + methodology generated by initShell() -->
<div id="shell-bottom"></div>

<!-- footer generated by initShell() -->
<div class="container">
<div id="shell-footer"></div>
</div>

<script src="../../assets/shell.js"></script>
<script src="../../assets/lang.js"></script>  <!-- MANDATORY: ENG|ITA toggle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
// ── SHELL CONFIG ──────────────────────────────────────────────────────────────
initShell({ /* config object — see schema 5.3 */ });

// ── CHART INIT ────────────────────────────────────────────────────────────────
// Containers exist in the DOM (sections above). roughViz uses <div>, chart.xkcd uses <svg>.
new roughViz.BarH({ element: '#chart-[id]', data: { labels: [...], values: [...] }, ... });
new chartXkcd.XY(document.getElementById('chart-[id2]'), { ... });
</script>
</body>
</html>
```

### 5.3 `initShell(config)` schema

```js
initShell({
  // ── RESEARCH QUESTION ────────────────────────────────────────────────────
  // Mandatory. Cleaned version of the user's original question (Phase 0).
  // Must preserve the original scope and intent — only grammar may change.
  researchQuestion: "How does Italy's defence spending compare to other EU countries?",
  // The SDMX quantity used to answer it, and why it approximates the question.
  statisticalProxy: "Eurostat GOV_10A_EXP — general government expenditure, % of GDP, sector S13, cofog99 GF0201 (defence)",

  // ── HEADER ──────────────────────────────────────────────────────────────
  title:   "Report title",
  date:    "29 April 2026",
  intro:   "Description in 2-3 sentences: what is analysed, why it matters.",
  badges: [
    { label: "Eurostat",  value: "DATASET_ID" },
    { label: "Period",    value: "2000–2024"  },
    { label: "Countries", value: "27"         }
  ],

  // ── NAV ─────────────────────────────────────────────────────────────────
  // "← Home", "↓ Intro", "Raw data" and "Methodology" added automatically.
  nav: [
    { id: "economy", label: "Economy" },
    { id: "labour",  label: "Labour"  }
  ],

  // ── INTRO ────────────────────────────────────────────────────────────────
  introTitle:    "Context and findings",            // optional, default if omitted
  introSubtitle: "One line of context",             // optional
  introExtra:    `<h3>...</h3><table>...</table>`,  // additional HTML before finding cards
  scopeLimit:    "What this data does NOT cover.",  // scope callout text
  findingCards: [
    { value: "14",   label: "indicators analysed",    color: "default" },
    { value: "−8pp", label: "employment drop 2008",   color: "accent"  },
    { value: "1.18", label: "TFR Sicily 2022",         color: "blue"    },
    { value: "35%",  label: "NEET under 30",           color: "green"   }
  ],
  // color: omitted or "default" → red accent; "blue" → accent2; "green" → green

  // ── RAW DATA ─────────────────────────────────────────────────────────────
  rawData: {
    license:        "Eurostat CC BY 4.0",
    extractionDate: "29 April 2026",  // default: cfg.date if omitted
    files: [
      {
        provider:  "Eurostat",
        datasetId: "LFST_R_LFE2EMPRT",
        desc:      "NUTS2 employment rate",
        rows:      312,
        period:    "2000–2023",
        file:      "output/A_occupazione.csv"
      }
    ]
  },

  // ── METHODOLOGY ──────────────────────────────────────────────────────────
  methodology: {
    githubUrl: "https://github.com/datapitch-it/automatic-reports/reports/09_sicilia-indicatori",
    classifications: [                  // optional
      { code: "ITG1",  system: "NUTS2",  meaning: "Sicily"    },
      { code: "TOTAL", system: "age",    meaning: "All ages"  }
    ],
    extra: `<p class="note pt-2 mb-4">...</p>`,  // additional HTML (double-check, tables) — optional
    apiUrls: [                          // omit for OECD/ISTAT (no public URLs exposed)
      {
        datasetId: "LFST_R_LFE2EMPRT",
        provider:  "Eurostat",
        desc:      "NUTS2 employment rate",
        url:       "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/..."
      }
    ],
    cliHdr:      "Dataset",   // column 1 header in CLI table (default "Dataset")
    cliCommands: [
      {
        dataset: "LFST_R_LFE2EMPRT",
        command: "opensdmx run queries/A_occupazione.yaml --out output/A_occupazione.csv"
      }
    ],
    files: [
      { file: "output/A_occupazione.csv",   desc: "312 rows · NUTS2 · 2000–2023"     },
      { file: "queries/A_occupazione.yaml", desc: "Reproducible query"               },
      { file: "notes.md",                   desc: "Chronological operations log"     }
    ]
  },

  // ── FOOTER ───────────────────────────────────────────────────────────────
  providers: "Eurostat · ISTAT",
  github:    "https://github.com/datapitch-it/automatic-reports"
});
```

---

## Phase 6 — Accountability standards

Every analysis must be verifiable step-by-step by anyone. This requires:

### In `notes.md` (chronological log)

```markdown
# Notes — [ANALYSIS TITLE]

## [DATE] — Phase 0: research question
...

## [DATE] — Phase 1: dataset search
- Command used: `opensdmx search "..." --provider ...`
- Datasets found: [list]
- Datasets selected and reason: ...
- Datasets excluded and reason: ...

## [DATE] — Phase 2: dimension exploration
- `opensdmx dimensions [ID] --provider ...` → output: [dimensions found]
- Choice: dimension X = value Y because: ...

## [DATE] — Phase 3: download
- Command: [full command]
- Output: [N rows], [N entities], [period]
- Anomalies found: [flags, missing values, etc.]

## [DATE] — Double check
- Run 1 (opensdmx get): [N rows], [sample value]
- Run 2 (direct URL):   [N rows], [sample value]
- Result: MATCH ✓ / DIVERGENCE ✗

## [DATE] — Phase 4: transformations
- [operation] → [result]

## [DATE] — Phase 5: charts
- Dataset [ID]: used [chart type] because [technical or narrative reason]
```

### In the HTML page

Each dataset section must have:

| Element | Required content |
|---|---|
| `.section-label` | Provider + Dataset ID + key dimension |
| `.subtitle` | Unit of measurement + filters + coverage |
| `.transform` | Source data (rows) + every operation applied |
| `.note` | Reading instructions + anomalies + source + chart library |
| Methodology section | Eurostat API URL (or CLI command for OECD) + reproducible YAML |
| Raw data section | CSV download link + rows + coverage + extraction date + licence |

### What NOT to do

- Never edit CSVs in `output/` by hand
- Never omit the transformations block even if trivial ("no transformations applied")
- Never use interpolated data without declaring it explicitly
- Never publish API URLs without having verified them by clicking
- Never choose a chart type that distorts perception (e.g. area chart for non-cumulative data)
- **Never truncate the Y-axis on absolute values**: for expenditure, counts, and other absolute series, the Y-axis must start at zero. A truncated absolute scale magnifies marginal variations and is a visual distortion.
- **Never add synthetic data points to force a zero baseline**: a point `{x: year, y: 0}` that does not exist in the source data is fabricated data. If auto-scaling creates a "wow" effect on a rate/percentage chart, address it with a contextualising sentence in the callout — not with an invented data point.
- **Never write "[Provider] does not cover X"** without having searched the provider's full catalogue. The correct formulation is always "this series/dataflow does not cover X". A provider may have dedicated dataflows for what the chosen series omits.
- **Never use third-party claim language for your own analytical choices**: in fact-check reports, distinguish clearly between "the data point that [Source] chose" and "the data point we selected for comparison". Column headers, table captions and body text must make this distinction explicit.

---

## Phase 7 — Narrative Executive Summary

### When to run this phase

Only after completing:
- Phase 5 (HTML page with all sections and charts rendered)
- Phase 6 (pre-publication checklist passed)

The summary is written **last** and positioned **first** on the page,
inside the `introExtra` field of the `initShell()` config.

---

### Step 1 — Pattern inventory (record in `notes.md`)

Before writing a single word, systematically identify the available patterns.
For each one, write down the exact value derived from the data.

**Time axis** — available if the report contains at least one `chart.xkcd.XY` chart
with 5+ years of data:
- What is the delta between the first and last year for the primary series?
- Is there a peak or minimum? In which year?
- Is the trend monotonic or has it had significant reversals?
- Source: JS arrays of XY charts, `.transform` blocks in HTML sections.

**Cross-country comparison** — available if the report contains at least one
`roughViz.BarH` with 5+ entities:
- What is the range between the highest and lowest value (most recent year)?
- What is the ratio between first and last? (e.g. "4× higher")
- Are there outliers that surprise by geographic location or reputation?
- Source: JS arrays of BarH charts (first and last element by value).

**'Surprise' finding** — actively identify it:
- Is there a result that contradicts the common assumption about the topic?
- Is there an unexpected correlation between two different sections of the report?
- Does a country behave opposite to its reputation?
- Does the expected "disadvantaged" group turn out to be favoured (or vice versa)?
- Source: cross-section comparison, not a single section.

Record the 3–5 strongest patterns found in `notes.md`:

```markdown
## [DATE] — Phase 7: patterns for executive summary
- Temporal: [description + value with year]
- Country: [range + outlier]
- Surprise: [finding with two values from different sections]
```

---

### Step 2 — Writing rules

- **3–4 paragraphs** of 4–6 lines each. No more.
- Each paragraph must integrate **at least 2 angles** from: temporal,
  cross-country comparison, surprise. Do not write mono-thematic paragraphs.
- **Every claim must cite an exact number** with year and unit, derived
  from the downloaded data. Zero invented or memory-approximated values.
- **Every cited section must have a link** `<a href="#section-id">` to the
  corresponding HTML section. Do not cite data without indicating where to find it.
- Do not repeat values already present in `findingCards`.
- The summary language follows the language chosen in Phase 0.

**Adapting to available data**

Not all reports have time series, international comparisons or a surprise finding.
Before writing, verify the availability of each angle:

| Angle | Available if... | If not available |
|---|---|---|
| Temporal | at least one XY chart with 5+ years | compensate with more depth on the other two angles |
| Country comparison | at least one BarH with 5+ entities | compensate with internal granularity (e.g. by age, sector) |
| Surprise | a result exists that inverts an assumption — identify it actively | if genuinely absent, do not invent one; use two temporal and two comparison paragraphs |

Do not write generic paragraphs to "fill" a schema.

---

### Step 3 — HTML template for `introExtra`

Insert the summary in the `introExtra` field of `initShell()`.
The section title is in the report language (e.g. "What the data says",
"Cosa dicono i dati", "Ce que disent les données").

```js
introExtra: `
  <div class="summary mb-5">
    <h3 class="mb-3">[Section title in report language]</h3>
    <p>
      [Paragraph 1: opens with the main finding or strongest trend.
      Integrates at least one value with year and at least one cross-country or group comparison.
      Closes with an unresolved tension that invites the reader to continue.]
      → <a href="#[section-id]">chart [ID]</a>
    </p>
    <p>
      [Paragraph 2: introduces a second dimension (gender, age, sector,
      geographic area). Shows where the pattern changes between countries or over time.
      Cites at least two concrete values from different sections.]
      → <a href="#[section-id]">chart [ID]</a>
    </p>
    <p>
      [Paragraph 3: the 'surprise' finding. A result that contradicts
      the prevailing assumption about the topic. Supported by at least two concrete
      values from different sections, with links to both sections.]
      → <a href="#[section-id-1]">chart [ID1]</a>,
         <a href="#[section-id-2]">chart [ID2]</a>
    </p>
    <!-- Optional paragraph 4: implications or open question -->
  </div>
`,
```

---

## Pre-publication checklist

- [ ] **Research question**: `researchQuestion` in `initShell()` matches the cleaned version in `notes.md`; original verbatim is recorded in `notes.md`; scope and intent unchanged from what the user asked
- [ ] **Statistical proxy**: `statisticalProxy` field filled and explains why the chosen SDMX indicator approximates the research question (and where it falls short)
- [ ] `reports.json` updated with the new entry (order, path, date, title, desc, badges)
- [ ] Every dataset has the "Double check passed" block in Methodology (run 1 + run 2 match)
- [ ] `notes.md` contains all phases with exact commands
- [ ] Every CSV in `output/` has the corresponding YAML file in `queries/`
- [ ] **Metadata**: the `metadata/` folder contains codelists (CSV) for every filtered or visualised dimension
- [ ] Page opens and charts render without console errors
- [ ] **Containers**: `roughViz` uses `<div>`, `chart.xkcd` uses `<svg>`
- [ ] All `↓ CSV` links work (local test)
- [ ] **Real links**: all `[URL...]` placeholders replaced with real links (e.g. library GitHub pages)
- [ ] Eurostat API URLs in the Methodology section return data when clicked
- [ ] The `.transform` block is present in every dataset section
- [ ] **Generation date**: present in `DD Month YYYY` format (in the report language) in all three places: `initShell({ date })`, Raw data callout, footer
- [ ] The Raw data section states extraction date and licence
- [ ] The "Scope limit" callout refers to **this specific series/dataflow**, not to the provider as a whole — formulation is "this series does not cover X", never "[Provider] does not cover X"
- [ ] **Edition ID**: the edition used for each dataset is recorded in `notes.md` and cited in the `.transform` block; confirmed as the latest available before publishing
- [ ] **Zero baseline**: absolute-value charts (€, persons, kg) have Y starting at zero; rate/percentage/index charts use auto-scaled range with an explicit note in `.note` explaining why zero is not shown — no synthetic data points added to force the baseline
- [ ] No `font-size` below `1rem` in chart JS configs (`axisFontSize`, `titleFontSize`, `labelFontSize`) — roughViz writes these values as inline styles on the SVG, which CSS cannot override without `!important`; the JS parameter is the only reliable control point
- [ ] **Executive Summary**: `introExtra` filled with 3–4 paragraphs, every claim cites an exact value with year, every cited section has a working `<a href>`
