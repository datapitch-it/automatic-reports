# Note — Spread BTP-Bund e rischio sovrano

## 8 maggio 2026 — Fase 0: domanda di ricerca

### Domanda originale (verbatim)
"Spread BTP-Bund e rischio sovrano: rendimenti sovrani IT/DE da ECB, debito pubblico/PIL da Eurostat GOV_10Q_GDP"

### Domanda pulita
Come è evoluto lo spread BTP-Bund dal 2010 a oggi e quali fattori macro lo spiegano?

### Proxy statistico
Eurostat IRT_LT_MCBY_M — rendimento obbligazionario a 10 anni (criterio di convergenza EMU, MCBY) per IT e DE. Spread calcolato come differenza mensile IT−DE. Debito/PIL: Eurostat GOV_10DD_EDPT1, indicatore GD (debito lordo consolidato EDP), settore S13, unità PC_GDP.

### Scope
Questa serie (IRT_LT_MCBY_M) non copre rendimenti a scadenze più brevi, CDS, né differenziali swap. Il debito/PIL da GOV_10DD_EDPT1 è il debito lordo consolidato EDP: non copre debito implicito (pensioni, garanzie statali) né variazioni di cassa infra-annuali.

### Provider candidati
- eurostat: constraints ✓, last_n ✓, categories ✓
- ecb: constraints ✗, last_n ✓, categories ✓ (dataset YC esplorato — yield curve BCE, non bilaterale per paesi)

---

## 8 maggio 2026 — Fase 1: ricerca dataset

### Comandi usati
```bash
opensdmx providers
opensdmx search "government bond yield" --provider ecb   # → nessun risultato
opensdmx search "bond yield" --provider ecb              # → nessun risultato
opensdmx search "interest rate" --provider ecb           # → IRS, MIR, RIR
opensdmx search "yield" --provider ecb                   # → YC (yield curve BCE — escluso: non è bilaterale)
opensdmx info IRS --provider ecb                         # → struttura IRS (escluso: retailbancario, non sovrano)
opensdmx search "long term government bond"              # → TEIMF050 (escluso: solo dati recenti 2025-2026)
opensdmx search "IRT_LT"                                 # → IRT_LT_GBY10_M, IRT_LT_MCBY_M, IRT_LT_MCBY_A, IRT_LT_MCBY_Q
opensdmx info IRT_LT_GBY10_M                             # → geo solo TR/US/JP → escluso (non UE)
opensdmx info IRT_LT_MCBY_M                              # → geo 30 paesi, 555 periodi → SELEZIONATO
opensdmx constraints IRT_LT_MCBY_M                      # → freq M, int_rt MCBY, geo 30 paesi, 555 periodi dal 1980
opensdmx constraints IRT_LT_MCBY_M geo                  # → confermati IT e DE presenti
opensdmx search "debt"                                   # → GOV_10Q_GGDEBT, GOV_10DD_EDPT1 (tra altri)
opensdmx info GOV_10DD_EDPT1                             # → freq A, unit (MIO_EUR/PC_GDP/NAC), sector S13, na_item 18, geo 31
opensdmx constraints GOV_10DD_EDPT1 na_item              # → GD = Government consolidated gross debt → SELEZIONATO
```

### Dataset selezionati
- **IRT_LT_MCBY_M** (Eurostat): rendimento obbligazionario 10 anni criterio di convergenza EMU, mensile, IT+DE, dal 2010
- **GOV_10DD_EDPT1** (Eurostat): deficit/debito/dati associati, annuale, IT+DE, dal 1995; filtrato a na_item=GD, unit=PC_GDP, sector=S13

### Dataset esclusi
- ECB YC: yield curve BCE — non fornisce rendimenti bilaterali per singoli paesi UE
- ECB IRS: interest rate statistics — copre tassi bancari (retail), non sovrani
- TEIMF050: solo dati recenti (2025-04 → 2026-03) — è un "Key Indicator" con finestra mobile
- IRT_LT_GBY10_M: geo solo TR, US, JP — per paesi extra-UE
- GOV_10Q_GDP: dataflow non trovato (ID non valido nella versione corrente di Eurostat)
- GOV_10Q_GGDEBT: debito trimestrale assoluto — non adatto per confronto strutturale debito/PIL

---

## 8 maggio 2026 — Fase 2: esplorazione dimensioni

```bash
opensdmx constraints IRT_LT_MCBY_M
# freq=M (1 valore), int_rt=MCBY (1 valore), geo=30 paesi, TIME_PERIOD=555 mesi
opensdmx constraints GOV_10DD_EDPT1
# freq=A, unit=3 (MIO_EUR, MIO_NAC, PC_GDP), sector=6, na_item=18, geo=31, TIME_PERIOD=31 anni
opensdmx constraints GOV_10DD_EDPT1 na_item
# GD = debito lordo consolidato → scelto perché è il concetto EDP/Maastricht standard
```

---

## 8 maggio 2026 — Fase 3: download

### Dataset A — IRT_LT_MCBY_M

```bash
opensdmx get IRT_LT_MCBY_M --geo IT+DE --start-period 2010-01 --out output/A_rendimenti_it_de.csv
```

Output: 390 righe, 2 paesi (IT, DE), mensile gen 2010 – mar 2026 (195 mesi per paese)
OBS_FLAG: nessun flag presente (colonna vuota per tutta la serie)
Note: int_rt=MCBY e freq=M hanno un solo valore disponibile, quindi non serve filtrarli esplicitamente

### Dataset B — GOV_10DD_EDPT1

```bash
opensdmx get GOV_10DD_EDPT1 --unit PC_GDP --sector S13 --geo IT+DE --start-period 1995 --out output/B_debito_pil_it_de.csv
```

Output: 826 righe, 2 paesi, annuale 1995–2025, tutti i na_item (18 indicatori × 2 paesi × 31 anni − alcuni mancanti = 826)
Nota: il flag `--na_item GD` è stato ignorato dalla CLI (dimensione con underscore non riconosciuta). 
Filtro applicato in post-processing: selezione righe con na_item = GD → 32 osservazioni (16 anni × 2 paesi)
OBS_FLAG: nessun flag nella serie GD per IT e DE

---

## 8 maggio 2026 — Double check

### Dataset A — IRT_LT_MCBY_M
- Run 1 (opensdmx get): 391 righe (390 dati + header)
- Run 2 (URL diretto):
  `curl "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/IRT_LT_MCBY_M/M.MCBY.IT+DE/?startPeriod=2010-01&format=SDMX-CSV" | wc -l`
  → 391 righe
- Risultato: MATCH ✓

### Dataset B — GOV_10DD_EDPT1
- Run 1 (opensdmx get): 827 righe (826 dati + header)
- Run 2 (URL diretto):
  `curl "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/GOV_10DD_EDPT1/A.PC_GDP.S13..IT+DE/?startPeriod=1995&format=SDMX-CSV" | wc -l`
  → 827 righe
- Risultato: MATCH ✓

---

## 8 maggio 2026 — Fase 4: trasformazioni

### Dataset A
- Spread = rendimento IT − rendimento DE per ciascun mese: 195 valori
- X-axis: anno decimale (anno + (mese−1)/12) per rappresentazione continua in chart.xkcd
- Min spread: 0,644 pp (febbraio 2026)
- Max spread: 5,19 pp (novembre 2011)
- Spread attuale: 0,823 pp (marzo 2026)

### Dataset B
- Filtro: na_item = GD → 32 righe mantenute su 826
- Filtro: anni >= 2010 → 16 anni per paese
- Debito IT: da 118,8% (2010) a 137,1% (2025); picco 154,4% (2020)
- Debito DE: da 81,0% (2010) a 63,5% (2025); minimo 58,7% (2019)

---

## 8 maggio 2026 — Fase 5: grafici

- Sezione A (spread): chart.xkcd XY, serie singola (spread mensile IT−DE), 195 punti
- Sezione B (rendimenti): chart.xkcd XY, due serie (BTP e Bund), 195 punti ciascuna
- Sezione C (debito/PIL): chart.xkcd XY, due serie (IT e DE), 16 punti annuali ciascuna
- Tutti chart.xkcd: dotSize basso (0.2–0.5) per ridurre il rumore visivo con molti punti

---

## 8 maggio 2026 — Fase 7: pattern per executive summary

- Temporale: spread da 82 bp (gen 2010) → picco 519 bp (nov 2011) → 64 bp (feb 2026) → 82 bp (mar 2026)
- Paese: debito IT 118,8% (2010) vs DE 81,0% (2010); divergenza massima al 2020: IT 154,4% vs DE 68,0% (delta 86,4 pp)
- Sorpresa: spread mar 2026 = spread gen 2010 (entrambi 82 bp), ma debito IT è passato da 118,8% a 137,1% — la "normalizzazione" dello spread non riflette un miglioramento dei fondamentali italiani
- Nota Bund negativo: ago 2019 DE = −0,65%, IT = 1,37% → spread = 2,02 pp: la fase a tassi negativi ha inflato meccanicamente il differenziale
