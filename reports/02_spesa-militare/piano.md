# Piano di ricerca: Spesa militare e industria della difesa (SDMX)

**Data avvio**: 2026-04-08  
**Provider principali**: Eurostat (default), OECD  
**Strumento**: opensdmx CLI  

---

## Obiettivo

Raccogliere dati statistici pubblici sulla spesa per la difesa e l'industria degli armamenti,
usando provider SDMX istituzionali. I dati coprono la *domanda pubblica* di difesa
(spesa governativa), che è la proxy migliore disponibile in formato SDMX per l'industria
degli armamenti. Dati su singole aziende non sono disponibili via SDMX.

---

## Dataset identificati

| ID | Provider | Descrizione |
|----|----------|-------------|
| `GOV_10A_EXP` | Eurostat | Spesa pubblica per funzione (COFOG) — include difesa militare |
| `TSC00008` | Eurostat | Quota R&D governativo allocata alla difesa |
| OECD (TBD) | OECD | Confronti internazionali (USA, Giappone, ecc.) |

---

## Fasi di lavoro

### Fase A — Spesa militare UE (% PIL), tutti i paesi, 2000–2024
- Dataset: `GOV_10A_EXP`
- Filtri: `cofog99=GF0201` (difesa militare), `unit=PC_GDP`, tutti i paesi
- Output: `output/A_spesa_militare_pil_eu.csv`

### Fase B — Focus paesi selezionati (IT, DE, FR, PL, ES, SE)
- Dataset: `GOV_10A_EXP`
- Filtri: stessi di A, ma solo 6 paesi + confronto con media EU27
- Output: `output/B_spesa_militare_paesi_selezionati.csv`
- Visualizzazione: grafico lineare comparativo (roughViz JS — `Line`)

### Fase C — R&D per la difesa
- Dataset: `TSC00008`
- Filtri: `nabs07=NABS14` (solo difesa), tutti i paesi, 2014–2025
- Output: `output/C_rd_difesa.csv`
- Visualizzazione: bar chart orizzontale (roughViz JS — `Bar`)

### Fase D — Confronto globale (OECD)
- Provider: OECD
- Ricerca dataset equivalenti con copertura extra-UE (USA, JP, KR, CA, TR)
- Output: `output/D_spesa_militare_oecd.csv`
- Visualizzazione: bar chart (roughViz JS — `BarH`)

### Note visualizzazioni
- Libreria: [roughViz](https://github.com/jwilber/roughViz) — grafici in stile "schizzo" via JS
- Ogni grafico è un file `.html` standalone che legge i dati da stringa inline (no server)
- I dati CSV vengono incorporati direttamente nell'HTML per massima portabilità

---

## Struttura cartella

```
test-ricerca-sdmx/
├── PIANO.md              ← questo file
├── LOG.md                ← log cronologico di ogni operazione
├── output/               ← file CSV scaricati
├── charts/               ← grafici generati
├── metadata/             ← codelist e metadati dimensioni
└── README.md             ← documentazione finale del dataset
```

---

## Note metodologiche

- **COFOG** (Classification of the Functions of Government): sistema ONU di classificazione
  delle funzioni della spesa pubblica. Il codice `GF02` = Difesa, `GF0201` = Difesa militare.
- **GBARD** (Government Budget Appropriations or Outlays for R&D): misura gli stanziamenti
  di bilancio per R&D, non la spesa effettiva.
- La spesa in % del PIL è preferibile alla spesa assoluta per confronti internazionali,
  perché normalizza per la dimensione dell'economia.
- I dati OECD usano una metodologia analoga ma con copertura globale (inclusi USA, Giappone).
