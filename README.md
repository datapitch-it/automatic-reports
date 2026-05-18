# SpecJournalism — Spec Driven Data Journalism

A research and prototyping project applying Spec Driven Development principles to
AI-assisted statistical journalism using SDMX data sources (Eurostat, ISTAT, ECB, OECD, World Bank).

## What it does

- Applies a journalistic brief and null hypothesis before touching any data
- Fetches structured statistical data via SDMX providers using the `opensdmx` CLI
- Presents data as editorial reports in a newspaper-style web interface
- Default language: English (Italian/English bilingual toggle available per report)

## Methodology

The `spec/` folder contains the full SpecJournalism methodology:

```
spec/
├── specjournalism.md    — orchestrator, workflow, trigger commands
├── constitution.md      — immutable rules (visual honesty, reproducibility, language)
├── brief.md             — SJ-1: Story Brief
├── clarify.md           — SJ-2: structured clarifications
├── null-hypothesis.md   — SJ-3: falsifiability
├── data-design.md       — SJ-4: methodological plan
├── cross-check.md       — SJ-5: cross-artifact consistency gate
├── sdmx-pipeline.md     — Phases 1–3: opensdmx acquisition and inspection
├── charts.md            — Phase 4: Chart.js and D3 visualisation rules
├── html-page.md         — Phase 5: HTML page structure and initShell() config
├── accountability.md    — Phase 6: accountability standards and pre-publication checklist
├── executive-summary.md — Phase 7: narrative executive summary
└── tasks.md             — dependency-ordered execution checklist
```

## Project structure

```
spec/            — SpecJournalism methodology (source of truth)
index.html       — report catalogue
reports/         — individual HTML report pages
reports.json     — report metadata
assets/          — CSS, JS, fonts (shell.js, lang.js, style.css)
```

## Stack

- Static HTML + Bootstrap 5.3 + Chart.js 4 (+ D3 when needed)
- `assets/shell.js` — shared header/nav/footer renderer (`initShell(cfg)`)
- `assets/lang.js` — EN/IT toggle (opt-in per report)
- `assets/style.css` — shared styles
- No build step, no bundler

## How to start a new analysis

Tag the relevant spec file in the chat to trigger each phase:

| Command | Tag | What it produces |
|---|---|---|
| Start a new analysis | `@spec/brief.md` | `story-brief.md` |
| Clarify scope | `@spec/clarify.md` | Clarifications in `story-brief.md` |
| Pre-register hypothesis | `@spec/null-hypothesis.md` | Null hypothesis in `story-brief.md` |
| Plan the data | `@spec/data-design.md` | `data-design.md` |
| Check consistency | `@spec/cross-check.md` | Cross-check report in `notes.md` |
| Acquire data | `@spec/sdmx-pipeline.md` | `output/*.csv`, `queries/*.yaml`, `metadata/` |
| Build charts | `@spec/charts.md` | Chart.js sections in `index.html` |
| Build the page | `@spec/html-page.md` | `reports/NN_slug/index.html` |
| Accountability check | `@spec/accountability.md` | Pre-publication checklist |
| Write summary | `@spec/executive-summary.md` | `introExtra` in `initShell()` |

Full pre-phase sequence: tag `@spec/brief.md` → `@spec/clarify.md` → `@spec/null-hypothesis.md` → `@spec/data-design.md`

Load constitution first in any session: `@spec/constitution.md`

## Requirements

- [`opensdmx`](https://github.com/ondata/opensdmx) CLI available in PATH
- A static HTTP server (e.g. `python3 -m http.server`)

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
