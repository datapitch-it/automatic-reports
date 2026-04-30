# Piano di refactoring — JS shell

## Obiettivo

Centralizzare CSS e struttura HTML in file condivisi, riducendo il costo token di generazione
e semplificando la manutenzione del design.

Vincoli da rispettare:
- nessun build step
- solo file statici (HTML, CSS, JS, CSV) nel repository
- compatibile con GitHub Pages e localhost:8000
- workflow invariato: Claude genera → verifica → commit → push
- i report restano apribili anche con `file://` (no `fetch()` nei report singoli)

---

## Ricognizione pattern (9 report esistenti)

### Tipi di grafico usati

| Tipo | Container | Report |
|---|---|---|
| `roughViz.BarH` | `<div>` | 01, 02, 03, 04, 05, 06, 07, 08 |
| `roughViz.Bar`  | `<div>` | 03, 05, 08 |
| `roughViz.Line` | `<div>` | solo 09 |
| `chartXkcd.XY`  | `<svg>` | 01, 02, 03, 04, 05, 06, 07, 08 |

`roughViz.Scatter` e `roughViz.Pie` non compaiono mai.

### Layout e pattern speciali

| Pattern | Report |
|---|---|
| Singolo chart per sezione | tutti |
| Più chart in sequenza nella stessa sezione | 02, 03, 04, 05, 06, 07, 08, 09 |
| Due chart affiancati (`col-md-6`) | 06 |
| `chart-title-label` sopra il grafico | 05, 06, 07, 08 |
| `min-height` inline sul container | 04, 06 |
| Small multiples statici (HTML fisso) | 02 (7 `sm-card` SVG) |
| Small multiples dinamici (JS crea i container) | 03, 06 |
| Verdict table (`✅ CONFERMATO`) | 08, 09 |
| Sezione senza grafici | 06 (`produzione`) |

### Conclusione critica dalla ricognizione

Il layout interno alle sezioni dataset (chart affiancati, small multiples dinamici, min-height
custom, verdict table) è troppo vario per essere codificato in un config JSON senza perdere
flessibilità. Le sezioni dataset **restano scritte dall'AI in HTML**.

`initShell()` gestisce solo le parti strutturalmente identiche in tutti i report:
nav, header, intro (finding cards + scope callout), dati grezzi, metodologia, footer.

---

## Risparmio stimato

| Parte rimossa dall'output AI | Righe risparmiate |
|---|---|
| Blocco `<style>` → `style.css` | ~150 |
| Nav + header → `initShell()` | ~35 |
| Sezione intro + finding cards → `initShell()` | ~40 |
| Sezione dati grezzi → `initShell()` | ~45 |
| Sezione metodologia → `initShell()` | ~60 |
| Footer → `initShell()` | ~10 |
| **Totale per report** | **~340 righe** |

Da ~700 righe a ~360 righe per report. `journoai.md`: da 834 → ~500 righe.

---

## Architettura target

```
/
├── index.html              ← catalogo (aggiornato: legge reports.json)
├── reports.json            ← manifest dei report (nuovo)
├── assets/
│   ├── style.css           ← CSS condiviso estratto dai report (nuovo)
│   └── shell.js            ← funzione initShell() (nuovo)
├── reports/
│   └── 09_sicilia-indicatori/
│       ├── index.html      ← ~360 righe: placeholder shell + sezioni AI + config JS
│       ├── output/*.csv
│       ├── queries/*.yaml
│       ├── metadata/
│       └── notes.md
└── journoai.md             ← aggiornato: template HTML e CSS rimossi
```

---

## Fase 1 — `assets/style.css`

Estrarre il blocco `<style>` da `01_gender-pay-gap/index.html`.
È identico in tutti i report — basta una copia.

Due aggiunte necessarie rispetto al CSS attuale dei report:
- `.verdict-table` (presente in 08 e 09 ma non nel CSS comune — va aggiunto)
- nessun'altra classe mancante rilevata nella ricognizione

Verificare visivamente su localhost dopo aver collegato il file a un report.

---

## Fase 2 — `assets/shell.js`

Implementare `initShell(config)` che popola i quattro placeholder `<div>` nel DOM:

- `#shell-top` → nav sticky + header (site-header)
- `#shell-intro` → sezione intro (finding cards + callout scope)
- `#shell-bottom` → sezione dati grezzi + sezione metodologia
- `#shell-footer` → footer

La funzione è **sincrona**. I placeholder esistono nel DOM quando viene chiamata
(sono nel `<body>` sopra lo `<script>` che la invoca).

Schema del parametro `config`:

```js
initShell({
  // ── HEADER ──────────────────────────────────────────────────────────────
  title:   "Sicilia in numeri: 14 indicatori strutturali",
  date:    "29 aprile 2026",
  intro:   "Com'è cambiata la Sicilia negli ultimi vent'anni?...",
  badges: [
    { label: "Eurostat",    value: "NUTS2 ITG1" },
    { label: "Periodo",     value: "1990–2025"  },
    { label: "Indicatori",  value: "14"         }
  ],

  // ── NAV ─────────────────────────────────────────────────────────────────
  // Link per ogni sezione dataset. "Dati grezzi" e "Metodologia" aggiunti automaticamente.
  nav: [
    { id: "economia",   label: "Economia"   },
    { id: "lavoro",     label: "Lavoro"     },
    { id: "demografia", label: "Demografia" },
    { id: "benessere",  label: "Benessere"  }
  ],

  // ── INTRO ────────────────────────────────────────────────────────────────
  scopeLimit: "I dati NUTS2 non coprono i comuni; le serie ISTAT hanno interruzioni...",
  findingCards: [
    { value: "14",   label: "indicatori analizzati",  color: "default" },
    { value: "−8pp", label: "calo occupazione 2008",  color: "accent"  },
    { value: "1,18", label: "TFR Sicilia 2022",        color: "blue"    },
    { value: "35%",  label: "NEET under 30",           color: "green"   }
  ],

  // ── DATI GREZZI ──────────────────────────────────────────────────────────
  rawData: {
    license:        "Eurostat CC BY 4.0",
    extractionDate: "29 aprile 2026",
    files: [
      {
        provider:  "Eurostat",
        datasetId: "LFST_R_LFE2EMPRT",
        desc:      "Tasso di occupazione NUTS2",
        rows:      312,
        period:    "2000–2023",
        file:      "output/A_occupazione.csv"
      }
    ]
  },

  // ── METODOLOGIA ──────────────────────────────────────────────────────────
  methodology: {
    classifications: [
      { code: "ITG1",   system: "NUTS2",    meaning: "Sicilia"          },
      { code: "TOTAL",  system: "age",      meaning: "Tutte le età"     }
    ],
    apiUrls: [
      {
        datasetId: "LFST_R_LFE2EMPRT",
        provider:  "Eurostat",
        desc:      "Tasso di occupazione NUTS2",
        url:       "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/LFST_R_LFE2EMPRT/A.PC.EMP_LFS.Y15-64.T.ITG1/?format=SDMX-CSV"
      }
    ],
    cliCommands: [
      {
        dataset: "LFST_R_LFE2EMPRT",
        command: "opensdmx run queries/A_occupazione.yaml --out output/A_occupazione.csv"
      }
    ],
    files: [
      { file: "output/A_occupazione.csv",   desc: "312 righe · NUTS2 · 2000–2023"  },
      { file: "queries/A_occupazione.yaml", desc: "Query riproducibile"             },
      { file: "notes.md",                   desc: "Log cronologico delle operazioni" }
    ]
  },

  // ── FOOTER ───────────────────────────────────────────────────────────────
  providers: "Eurostat · ISTAT",
  github:    "https://github.com/datapitch-it/automatic-reports"
});
```

---

## Fase 3 — Nuovo formato `index.html` per i report

L'AI genera questo. Le sezioni dataset sono HTML puro (invariate rispetto ad oggi,
ma senza il blocco `<style>`). Il resto è generato da `initShell()`.

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITOLO] — Ricerca SDMX</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="../../assets/style.css">
  <script src="https://unpkg.com/rough-viz@1.0.6"></script>
  <script src="https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13/runtime.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.xkcd@1.1/dist/chart.xkcd.min.js"></script>
</head>
<body>

<!-- nav + header generati da initShell() -->
<div id="shell-top"></div>

<!-- intro (finding cards + scope) generata da initShell() -->
<div id="shell-intro"></div>

<main class="container py-2">

  <!-- ═══ SEZIONI DATASET — scritte dall'AI, invariate ═══ -->

  <section class="section py-5" id="[id]">
    <p class="section-label mb-1">...</p>
    <h2 class="mb-2">...</h2>
    <p class="subtitle mb-4">...</p>
    <!-- callout opzionale, note, chart-wrap, transform: scritti dall'AI -->
    <div class="chart-wrap mb-4">
      <div id="chart-[id]"></div>   <!-- oppure <svg> per chart.xkcd -->
    </div>
    <div class="transform p-3 mb-4">...</div>
  </section>

  <!-- ═══ FINE SEZIONI DATASET ═══ -->

</main>

<!-- dati grezzi + metodologia generati da initShell() -->
<div id="shell-bottom"></div>

<!-- footer generato da initShell() -->
<div id="shell-footer"></div>

<script src="../../assets/shell.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
// ── CONFIG SHELL ─────────────────────────────────────────────────────────────
initShell({ /* oggetto config completo */ });

// ── CHART INIT ───────────────────────────────────────────────────────────────
// I container esistono nel DOM (scritti dall'AI nelle sezioni sopra).
new roughViz.BarH({ element: '#chart-[id]', data: { labels: [...], values: [...] }, ... });
new chartXkcd.XY(document.getElementById('chart-[id2]'), { ... });
</script>
</body>
</html>
```

---

## Fase 4 — `reports.json` e catalogo

Creare `reports.json` nella root:

```json
[
  {
    "order":  9,
    "path":   "reports/09_sicilia-indicatori/index.html",
    "date":   "29 aprile 2026",
    "title":  "Sicilia in numeri: 14 indicatori strutturali",
    "desc":   "Com'è cambiata la Sicilia negli ultimi vent'anni?...",
    "badges": [
      { "label": "Eurostat",   "value": "NUTS2 ITG1" },
      { "label": "Periodo",    "value": "1990–2025"  },
      { "label": "Indicatori", "value": "14"         }
    ]
  }
]
```

Aggiornare `index.html` (catalogo) per leggere `reports.json` via `fetch()` e costruire
la lista dinamicamente. Il catalogo usa sempre localhost o GitHub Pages — `fetch()` è lecito.

Aggiungere un nuovo report = aggiornare solo `reports.json`, nessuna modifica a `index.html`.

---

## Fase 5 — Aggiornare `journoai.md`

**Rimuovere**:
- Sezione "Template HTML completo" con CSS inline (~300 righe)
- Regole su classi CSS, font-size, margini, overflow nei grafici (~80 righe)
- Checklist elementi CSS/HTML (~15 righe)

**Aggiungere**:
- Schema `initShell()` con tutti i campi (~80 righe)
- Istruzione: non scrivere CSS, non scrivere nav/header/footer/intro/dati/metodologia
- Istruzione: scrivere solo le sezioni dataset + config initShell() + chart init JS
- Istruzione: aggiornare `reports.json` dopo ogni nuovo report
- Regole chart invariate: baseline zero, `<div>` vs `<svg>`, font 1rem, UPPERCASE label

Risultato stimato: da 834 → ~500 righe.

---

## Fase 6 — Migrazione dei 9 report esistenti

Per ogni report:

1. Eliminare il blocco `<style>` (~150 righe)
2. Sostituire nav + header con `<div id="shell-top"></div>`
3. Sostituire sezione intro con `<div id="shell-intro"></div>`
4. Sostituire sezioni dati grezzi e metodologia con `<div id="shell-bottom"></div>`
5. Sostituire footer con `<div id="shell-footer"></div>`
6. Aggiungere i quattro `<script>` (`style.css`, `shell.js`, `bootstrap.js`, `initShell()`)
7. Compilare il config `initShell()` con i dati estratti dal vecchio HTML
8. Verificare su localhost:8000 che il risultato sia visivamente identico

---

## Ordine di esecuzione

```
[ ] 1. Creare assets/style.css       (estrazione da report 01 + aggiunta .verdict-table)
[ ] 2. Creare assets/shell.js        (initShell() — prototipo sufficiente per report 01)
[ ] 3. Migrare report 01             (prototipo — verifica estesa prima di procedere)
[ ] 4. Migrare report 02–09          (uno alla volta, verifica rapida ognuno)
[ ] 5. Creare reports.json           (9 entry)
[ ] 6. Aggiornare index.html         (catalogo dinamico da reports.json)
[ ] 7. Aggiornare journoai.md        (rimuovi template, aggiungi schema initShell)
[ ] 8. Test completo su localhost    (tutti i report + catalogo)
[ ] 9. Commit e push
```

---

## Nota sui pattern complessi (no rischio)

I pattern emersi dalla ricognizione (small multiples dinamici, chart affiancati, verdict table,
min-height inline) **non richiedono modifiche a `initShell()`** perché restano nelle sezioni
dataset scritte dall'AI. L'unico intervento su `style.css` è aggiungere `.verdict-table`
(usata da report 08 e 09 ma assente nel CSS comune degli altri report).
