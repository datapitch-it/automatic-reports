# JournAI — Statistical data analysis with SDMX

A research and prototyping project exploring AI-assisted statistical journalism using SDMX data sources (Eurostat, ISTAT, ECB, OECD, World Bank).

## What it does

- Fetches structured statistical data via SDMX providers using the `opensdmx` CLI
- Presents data as editorial reports in a newspaper-style web interface
- Supports Italian/English language toggle via `?lang=ITA` / `?lang=ENG` URL params

## Structure

```
index.html       — main report index
reports/         — individual HTML report pages
reports.json     — report metadata
assets/          — CSS, JS, fonts
```

## Requirements

- [`opensdmx`](https://github.com/bis-med-it/pysdmx) CLI available in PATH
- A static HTTP server (e.g. `python3 -m http.server`)

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
