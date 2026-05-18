# JournAI — Phases 1–3: SDMX Pipeline

## Purpose

Technical execution phases for data acquisition using the opensdmx CLI.
These phases are constrained by `data-design.md` (Phase SJ-4).
Do not run these phases without a complete `data-design.md`.

**Stack**: opensdmx CLI · SDMX 2.1 REST API

---

## Phase 0 — Research question

Derive the cleaned research question from `story-brief.md` (`journalistic_angle` field).
Do not rewrite the scope or intent. Only grammar and punctuation may change.

Record in `notes.md`:

```markdown
## [DATE] — Phase 0: Research question

### Original (verbatim)
[Exact words from story-brief.md journalistic_angle — do not paraphrase]

### Cleaned
[Same question, lightly corrected for grammar and punctuation only]

## Statistical proxy
[Which SDMX quantity approximates the phenomenon, and why it is a good (or imperfect) proxy]
```

The cleaned version is the one that goes into `researchQuestion` in `initShell()`.
The verbatim original stays in `notes.md` only.

---

## Phase 1 — Dataset search

### 1.1 List available providers

> **This is the first mandatory command of every analysis.**
> The provider list changes with opensdmx updates: always run this check first.

```bash
opensdmx --output json providers
```

Output: JSON array with `alias`, `name`, `agency_id`, `constraints_supported`,
`last_n_supported`, `categories_supported`.

Record candidate providers in `notes.md`. Key columns and what they imply:
- **`constraints_supported`**: if `false`, use `opensdmx values` instead of
  `opensdmx constraints` to explore valid codes.
- **`last_n_supported`**: if `false`, do not use `--last-n` in queries.
- **`categories_supported`**: if `false`, skip `opensdmx tree`, use `opensdmx search` directly.

### 1.2 Search for datasets by keyword

```bash
opensdmx search "<keyword>" --provider <provider_id>
# examples:
opensdmx search "government expenditure" --provider estat
opensdmx search "defence" --provider oecd
```

Search multiple keyword variants. Record all datasets found in `notes.md` with the reason
each is included or excluded. Cross-reference with the dataset IDs in `data-design.md`.

### 1.3 Get information about a dataset

```bash
opensdmx info <DATASET_ID> --provider <provider_id>
# example:
opensdmx info GOV_10A_EXP --provider estat
```

Output: description, available dimensions, periodicity, geographic coverage.

### 1.4 Explore dimensions and download metadata

For every dimension that is filtered or used as an axis/series in a chart, download the
codelist into `metadata/`. This ensures the report is consultable offline.

**Explore constraints** (preferred when `constraints_supported = true`):
```bash
opensdmx constraints <DATASET_ID> --provider <provider_id>
```

**Explore values** (when `constraints_supported = false`):
```bash
opensdmx values <DATASET_ID> <DIMENSION_NAME> --provider <provider_id>
```

**Download codelist to metadata/**:
```bash
opensdmx -o csv values <DATASET_ID> <DIMENSION_NAME> --provider <provider_id> \
  > metadata/<QUERY_NAME>-meta.csv
# example: if data file is output/A_military.csv
opensdmx -o csv values GOV_10A_EXP cofog99 --provider estat > metadata/A_military-meta.csv
```

Naming convention: if a query involves multiple critical dimensions, use
`<QUERY_NAME>-meta-<DIMENSION>.csv`.

Record in `notes.md` for every dimension used: the chosen code and the reason for the choice.

---

## Phase 2 — Data acquisition

### 2.1 Query with explicit filters

```bash
opensdmx get "<DATASET_ID>" \
  --provider <provider_id> \
  --<DIMENSION_1> <value> \
  --<DIMENSION_2> <val1>+<val2>+<val3> \
  --start-period <YYYY> \
  --end-period <YYYY> \
  --out output/A_slug.csv
```

**Rules:**
- Multiple values for a dimension are separated with `+`
- Omitting a dimension = all available values
- Always use `--out` to save to `output/`
- The CSV file must never be edited by hand
- **Always record the edition ID**: every dataset has a publication edition
  (e.g. `2026M4G30` for ISTAT). Record it in `notes.md` and cite it in the `.transform`
  block on the page. Before publishing, verify the edition is the latest available.

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
  --out output/A_defence.csv
```

### 2.2 Direct API URL (Eurostat)

For Eurostat, every query corresponds to a publicly accessible URL:

```
https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/<DATASET_ID>/<FREQ>.<DIM2>.<DIM3>.<DIM4>.<DIM5>./<GEO>/?startPeriod=<YYYY>&endPeriod=<YYYY>&format=SDMX-CSV
```

The dimension order in the path follows the order returned by `opensdmx dimensions`.
**This URL must be included in the HTML page under the Methodology section** as a
clickable `<a href>`.

For OECD and ISTAT, no public URL is exposed: document the CLI command instead.

### 2.3 Double-check — repeat every extraction twice

**Mandatory rule**: every `opensdmx get` query must be run twice independently.

- First run: explicit filters via flags (`--geo NL --unit PC_GDP ...`)
- Second run: direct Eurostat API URL via `curl` or browser (or alternative CLI call)

Results are validated only if row count, values and dimensions match. If they diverge,
investigate before proceeding.

Record in `notes.md`:

```markdown
## Double check — [DATASET_ID]
- Run 1 (opensdmx get): [N rows], [sample value or checksum]
- Run 2 (direct URL / alternative):   [N rows], [sample value]
- Result: MATCH ✓ / DIVERGENCE ✗ — [explanation if divergence]
```

In the HTML page, Methodology section, add for each validated dataset:

```html
<p class="note pt-2 mb-2">
  <strong>Double check passed</strong> — Data for <code>[DATASET_ID]</code> was
  extracted twice independently and results match:
  [N rows], period [YYYY–YYYY], [N entities].
</p>
```

### 2.4 Save the query as a reproducible YAML

```yaml
# queries/A_slug.yaml
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

Always save in `queries/`. One YAML per `output/*.csv`. No exceptions.

To regenerate data from the YAML:
```bash
opensdmx run queries/A_slug.yaml --out output/A_slug.csv
```

---

## Phase 3 — Inspection and transformations

### 3.1 Inspect the downloaded CSV

```bash
head -5 output/A_slug.csv
wc -l output/A_slug.csv
```

Record in `notes.md`:
- Number of rows
- Columns present and their meaning
- Unique values for key dimensions (countries, years, units)
- Presence of flags (`OBS_FLAG`): `p` = provisional, `d` = different definition,
  `b` = series break
- Missing data: absent countries or years
- Edition/version ID

### 3.2 Document every transformation

For every transformation applied, record in `notes.md` and then in the `.transform` block
on the HTML page:

```markdown
### Transformations — Dataset A
- Raw data: X rows, Y countries, years XXXX–XXXX
- [operation 1]: e.g. "selected the most recent available year per country"
- [operation 2]: e.g. "excluded country X (accounting revision, anomalous value)"
- [operation 3]: e.g. "calculated base-100 index as (value_year/base_value)×100"
- Final data used in the chart: Z observations
```

**Transformations are embedded as inline data in the HTML** (JS arrays or Chart.js data
objects) — not in separate CSV files. This ensures the page is self-contained.

Never edit `output/*.csv` by hand. The inline JS data is derived from the CSV via documented
transformations only.

After Phase 3 is complete, run `/sj.check` before proceeding to Phase 4.
