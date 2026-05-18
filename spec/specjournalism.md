# SpecJournalism — Spec Driven Data Journalism

## What this is

SpecJournalism is a methodology for producing data journalism analyses and statistical reports
using AI as orchestrator. It applies Spec Driven Development principles to data journalism:
the **Story Brief** is the source of truth. Datasets, methodology, charts and narrative are
continuously regenerated outputs.

SpecJournalism wraps a technical execution pipeline (SDMX data acquisition via opensdmx CLI,
Chart.js/D3 visualisations, self-contained HTML publication). It adds pre-phases and quality
gates that run before and during technical execution.

---

## Core principle

> The journalistic question is fixed first. Data choices serve the question.
> The question never bends to fit available data.

If the available data cannot answer the Story Brief, the story is paused —
not redefined to fit what is available.

---

## File map

| File | Role | When to load |
|---|---|---|
| `constitution.md` | Immutable rules — checked at every phase | Load first. Always. |
| `brief.md` | Story Brief instructions | Phase SJ-1 |
| `clarify.md` | Structured clarification questions | Phase SJ-2 |
| `null-hypothesis.md` | Falsifiability articulation | Phase SJ-3 |
| `data-design.md` | Methodological plan | Phase SJ-4 |
| `cross-check.md` | Cross-artifact consistency check | Phase SJ-5 (after Phase 3) |
| `sdmx-pipeline.md` | Phases 1–3: dataset search, acquisition, inspection | Phases 1–3 |
| `charts.md` | Phase 4: Chart.js and D3 visualisation rules and templates | Phase 4 |
| `html-page.md` | Phase 5: HTML page structure and initShell() config | Phase 5 |
| `accountability.md` | Phase 6: accountability standards and pre-publication checklist | Phase 6 |
| `executive-summary.md` | Phase 7: narrative executive summary rules | Phase 7 |
| `tasks.md` | Dependency-ordered execution checklist | Throughout |

---

## Full workflow

### Pre-phases (SpecJournalism)

```
SJ-0  Load constitution.md — verify it is current
SJ-1  Run brief.md         — produce story-brief.md
SJ-2  Run clarify.md       — fill Clarifications section in story-brief.md
SJ-3  Run null-hypothesis.md — fill Null hypothesis section in story-brief.md
SJ-4  Run data-design.md   — produce data-design.md for this analysis
SJ-5  [checkpoint] — do not proceed to technical execution without SJ-4 complete
```

### Technical execution

```
Phase 0  Research question — use cleaned version from story-brief.md, do not rewrite
Phase 1  Dataset search    — constrained by data-design.md choices (→ sdmx-pipeline.md)
Phase 2  Data acquisition  — opensdmx CLI, double-check rule (→ sdmx-pipeline.md)
Phase 3  Inspection        — CSV inspection, transformations (→ sdmx-pipeline.md)
[SJ-5 cross-check here]   — run cross-check.md before building charts
Phase 4  Visualisations    — Chart.js + D3 (→ charts.md)
Phase 5  Publication page  — initShell() HTML (→ html-page.md)
Phase 6  Accountability    — notes.md, pre-publication checklist (→ accountability.md)
Phase 7  Executive summary — narrative answers story-brief.md (→ executive-summary.md)
```

### Post-execution

```
SJ-6  Pre-publication checklist — pipeline checklist + SpecJournalism additions (→ accountability.md)
```

---

## Artefacts produced per analysis

```
reports/NN_slug/
├── story-brief.md        ← output of SJ-1 + SJ-2 + SJ-3
├── data-design.md        ← output of SJ-4
├── notes.md              ← chronological operations log
├── index.html            ← self-contained publication page
├── output/               ← CSVs downloaded from API, never edited by hand
├── queries/              ← YAML reproducible queries (one per CSV)
└── metadata/             ← codelists for filtered/visualised dimensions
```

`story-brief.md` and `data-design.md` are version-controlled alongside the code they describe.
When the journalistic angle changes, update `story-brief.md` first — then regenerate
`data-design.md` and affected downstream artefacts.

---

## Trigger commands

| Command | Loads | Produces |
|---|---|---|
| `/sj.brief` | `brief.md` | `story-brief.md` |
| `/sj.clarify` | `clarify.md` | Clarifications section in `story-brief.md` |
| `/sj.nullhyp` | `null-hypothesis.md` | Null hypothesis section in `story-brief.md` |
| `/sj.design` | `data-design.md` | `data-design.md` for this analysis |
| `/sj.check` | `cross-check.md` | Cross-check report in `notes.md` |
| `/sj.tasks` | `tasks.md` | Task list for this analysis |

Full pre-phase sequence: `/sj.brief` → `/sj.clarify` → `/sj.nullhyp` → `/sj.design`

---

## When NOT to use the full pipeline

The full SJ pre-phase sequence (SJ-1 through SJ-4) is designed for:
- New analyses starting from a journalistic angle
- Analyses with multiple datasets or non-obvious data selection
- Investigations where the null hypothesis needs pre-registration

**Skip pre-phases and go directly to the execution pipeline for:**
- Single-dataset extractions with a clear, pre-defined research question
- Updates to existing reports (new data vintage, extended period)
- Technical experiments with no publication intent

When in doubt, run at minimum `/sj.brief` and `/sj.nullhyp`.
The brief costs five minutes. Skipping it costs a story.
