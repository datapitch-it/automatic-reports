# Note — Sicilia in numeri: 14 indicatori su 4 decenni

## Domanda di ricerca
Com'è cambiata la Sicilia nel periodo coperto dai dati? Analisi di 14 indicatori strutturali su economia, mercato del lavoro, demografia e benessere sociale, con checkpoint ogni 5 anni.

## Proxy statistica
Serie storiche regionali per la Sicilia (codice NUTS2: ITG1 per Eurostat/OECD; da verificare per ISTAT) su PIL, occupazione, disoccupazione, inattività, NEET, fertilità, migrazioni, reddito, povertà, istruzione, spesa pubblica.

## Scope
Dati a livello NUTS2 (Sicilia). Esclusi: dati provinciali/comunali, dati infra-annuali, indicatori di qualità della vita non coperti da SDMX (es. criminalità, ambiente, infrastrutture).

## Provider candidati
- Eurostat (alias: eurostat / estat) — NUTS2 ITG1 — constraints_supported: true
- ISTAT (alias: istat) — codice regione da verificare — constraints_supported: true
- OECD (alias: oecd) — TL2 regioni — constraints_supported: false

## Lingua
Italiano

## Angolazione
Com'è cambiata la Sicilia nel periodo [ANNI] — 4 checkpoint ogni 5 anni

---

## 2026-04-29 — Fase 0: domanda di ricerca
Definita domanda e struttura. 4 sezioni tematiche: Economia, Lavoro, Demografia, Benessere sociale.
14 indicatori da 3 provider.

## 2026-04-29 — Fase 1: verifica copertura temporale e codici regionali

### Aggiornamento Fase 1 — Codice regionale e copertura temporale verificati

**Codice Sicilia**: ITG1 — consistente in Eurostat, ISTAT e OECD.

**Tabella finale indicatori:**

| # | Indicatore | Dataset | Copertura | Checkpoint |
|---|---|---|---|---|
| 1 | PIL pro capite PPS | Eurostat `nama_10r_2gdp` | 2000–2024 | 2024, 2019, 2014, 2009 |
| 2 | Tasso occupazione 20-64 | Eurostat `lfst_r_lfe2emprt` | 1999–2025 | 2025, 2020, 2015, 2010 |
| 3 | Tasso disoccupazione | Eurostat `lfst_r_lfu3rt` | 1999–2025 | 2025, 2020, 2015, 2010 |
| 4 | Tasso inattività 15-64 | ISTAT `152_1196_DF_DCCV_TAXINATT1_UNT2020_3` | 2004–2020 | 2020, 2015, 2010 |
| 5 | NEET rate 15-29 | Eurostat `EDAT_LFSE_22` | 2000–2025 | 2025, 2020, 2015, 2010 |
| 6 | Fertilità TFR | Eurostat `demo_r_find2` | 1990–2024 | 2024, 2019, 2014, 2009 |
| 7 | Saldo migratorio | Eurostat `demo_r_gind3` | 2000–2025 | 2025, 2020, 2015, 2010 |
| 8 | Migrazioni interne | ISTAT `28_185_DF_DCIS_MIGRAZIONI_1` | 2002–2024 | 2024, 2019, 2014, 2009 |
| 9 | S80/S20 reddito | Eurostat `ilc_di11_r` | 2003–2025 | 2025, 2020, 2015 |
| 10 | Rischio povertà AROPE | Eurostat `ilc_peps11n` | 2015–2025 | 2025, 2020 |
| 11 | Investimenti fissi lordi | Eurostat `nama_10r_2gfcf` | 2000–2024 | 2024, 2019, 2014, 2009 |
| 12 | Istruzione terziaria 25-64 | Eurostat `edat_lfse_04` | 2000–2025 | 2025, 2020, 2015, 2010 |
| 13 | PIL regionale USD PPP | OECD `DSD_REG_ECO@DF_GDP` | 2000–2024 | 2024, 2019, 2014, 2009 |
| 14 | Produttività lavoro | OECD `DSD_REG_ECO@DF_LPR` | 2000–2021 | 2021, 2016, 2011, 2006 |

**Indicatori scartati e motivazione:**
- `32_221_DF_DCCV_GINIREDD_1` (ISTAT Gini reddito): serie troppo corta (2020–2024, 5 anni), insufficiente per analisi storica con checkpoint ogni 5 anni. Sostituito con `ilc_di11_r` (S80/S20 NUTS2, Eurostat, 2003–2025).
- `gov_10a_exp` (Eurostat spesa PA): disponibile solo a livello nazionale (geo=IT), nessuna disaggregazione NUTS2. Sostituito con `nama_10r_2gfcf` (investimenti fissi lordi NUTS2, Eurostat, 2000–2024).

---

## 2026-04-29 — Fase 2: esplorazione dimensioni

Per ogni dataset, verificata la struttura via `opensdmx info` e i codici validi via `opensdmx constraints` (Eurostat/ISTAT) o `opensdmx values` (OECD).

**A — NAMA_10R_2GDP (PIL pro capite)**
- `opensdmx info NAMA_10R_2GDP --provider eurostat` → 5 dimensioni: FREQ, unit, geo, TIME_PERIOD + misura implicita
- Scelta `unit=PPS_HAB_EU27_2020` (indice EU27=100) invece di `PPS_HAB` (valore assoluto): confronto relativo alla media europea più leggibile per pubblico non specialistico. `PPS_HAB` è risultato codice non valido; `PPS_HAB_EU27_2020` confermato via `opensdmx constraints`.
- Codelist scaricata: `metadata/A_pil_procapite-meta-unit.csv`

**B — LFST_R_LFE2EMPRT (tasso occupazione)**
- Dimensioni chiave: FREQ, sex, age, unit, geo
- Scelta `sex=T` (totale), `age=Y20-64` (fascia ILO standard per occupazione): coerente con indicatore EU2020/Europa 2030.
- Codelist scaricate: `metadata/B_occupazione-meta-sex.csv`, `metadata/B_occupazione-meta-age.csv`

**C — LFST_R_LFU3RT (tasso disoccupazione)**
- Dimensioni chiave: FREQ, sex, isced11, age, unit, geo
- Scelta `isced11=TOTAL` (tutti i livelli di istruzione), `age=Y15-74` (ILO standard).
- Codelist scaricate: `metadata/C_disoccupazione-meta-isced11.csv`, `metadata/C_disoccupazione-meta-age.csv`

**D — 152_1196_DF_DCCV_TAXINATT1_UNT2020_3 (inattività, ISTAT)**
- Serie ISTAT: dataset denominato "UNT2020" indica serie storica chiusa al 2020 (metodologia aggiornata).
- Dimensioni chiave: FREQ, REF_AREA, DATA_TYPE, SEX, AGE, EDU_LEV_HIGHEST, CITIZENSHIP
- Scelta `SEX=9` (totale), `AGE=Y15-64`, download senza filtro su `EDU_LEV_HIGHEST` → 85 righe grezze per tutti i livelli. Filtro applicato in JS: `EDU_LEV_HIGHEST=99` (totale).
- Codelist scaricata: `metadata/D_inattivita-meta-edu_lev.csv`

**E — EDAT_LFSE_22 (NEET)**
- Prima tentativo su ISTAT `172_931_DF_DCCV_NEET1_1`: disponibile solo per macro-aree (ITC, ITD, ITE, ITFG, non ITG1). Scartato.
- Eurostat `EDAT_LFSE_22` confermata copertura ITG1, 2000–2025.
- Dimensioni: FREQ, sex, age, training, wstatus, unit, geo (posizione verificata via `opensdmx info`)
- Scelta `sex=T`, `age=Y15-29`, `wstatus=NEMP` (non occupati), `training=NO_FE_NO_NFE` (non in istruzione formale né non formale), `unit=PC`.
- Nota: primo tentativo URL double check fallito per ordine dimensioni errato; corretto dopo `opensdmx info`.
- Codelist scaricate: `metadata/E_neet-meta-sex.csv`, `metadata/E_neet-meta-age.csv`, `metadata/E_neet-meta-wstatus.csv`

**F — DEMO_R_FIND2 (fertilità TFR)**
- Dataset `demo_r_tfrate` non accessibile direttamente; usato `DEMO_R_FIND2` (fertility indicators by NUTS2).
- Dimensioni: FREQ, indic_de, geo
- Scelta `indic_de=TOTFERRT` (total fertility rate).
- Codelist scaricata: `metadata/F_fertilita-meta-indic_de.csv`

**G — DEMO_R_GIND3 (saldo migratorio)**
- Dataset tecnicamente NUTS3; aggregazione NUTS2 disponibile per 2000 e 2012–2024 (lacuna strutturale 2001–2011).
- Dimensioni: FREQ, indic_de, geo
- Scelta `indic_de=CNMIGRAT` (net migration including statistical adjustment).
- Anomalia post-2021: valori positivi (+9.121 nel 2024) presumibilmente dovuti a revisione metodologica del calcolo del saldo (inclusione di migranti irregolari o rettifiche statistiche). Documentata come incerta, non come inversione strutturale.
- Codelist scaricata: `metadata/G_saldo_migratorio-meta-indic_de.csv`

**H — 28_185_DF_DCIS_MIGRAZIONI_1 (migrazioni interne, ISTAT)**
- Dataset contiene coppie origine-destinazione per tutte le regioni italiane.
- Dimensioni chiave: FREQ, REF_AREA, DATA_TYPE, CHANGE_OF_RESIDENCE, CITIZENSHIP, SEX, AGE, TERRITORY_NEXT_RESID, COUNTRY_PREV_RESID, COUNTRY_NEXT_RESID
- Scelta `REF_AREA=ITG1`, `SEX=9`, `DATA_TYPE=CORE`, `CITIZENSHIP=TOTAL`, `CHANGE_OF_RESIDENCE=ALL` → 720 righe grezze per tutte le destinazioni. Filtro JS: `TERRITORY_NEXT_RESID=IT` → 24 righe utili (emigrazione totale verso Italia).
- Codelist scaricata: `metadata/H_migrazioni_interne-meta-territory.csv`

**I — ILC_DI11_R (S80/S20, Eurostat)**
- `ilc_di11` (non regionale) ha solo `geo=IT`; `ILC_DI11_R` ha `ITG1=True`.
- Dimensioni: FREQ, unit, geo
- Scelta `unit=INX` (rapporto S80/S20 come indice).
- Codelist scaricata: `metadata/I_s80s20-meta-unit.csv`

**J — ILC_PEPS11N (AROPE)**
- Dataset regionale AROPE disponibile dal 2015 (serie più corta tra tutti gli indicatori).
- Dimensioni: FREQ, unit, geo
- Scelta `unit=PC` (percentuale di popolazione a rischio povertà o esclusione sociale).
- Codelist scaricata: `metadata/J_arope-meta-unit.csv`

**K — NAMA_10R_2GFCF (investimenti fissi lordi)**
- Sostituisce `GOV_10A_EXP` (spesa PA, disponibile solo a livello nazionale).
- Dataset contiene tutti i settori NACE: 360 righe grezze per ITG1. Filtro JS: `nace_r2=TOTAL` → 24 righe utili.
- Dimensioni: FREQ, sector, currency, nace_r2, geo
- Scelta `sector=S1` (economia totale), `currency=MIO_EUR`.
- Codelist scaricata: `metadata/K_investimenti-meta-nace_r2.csv`

**L — EDAT_LFSE_04 (istruzione terziaria)**
- Dimensioni: FREQ, sex, age, isced11, unit, geo
- Scelta `sex=T`, `age=Y25-64`, `isced11=ED5-8` (ISCED 5-8, istruzione terziaria).
- Codelist scaricate: `metadata/L_istruzione-meta-isced11.csv`, `metadata/L_istruzione-meta-age.csv`

**M — OECD.CFE.EDS,DSD_REG_ECO@DF_GDP (PIL OCSE)**
- OECD: `constraints_supported=false`, usato `opensdmx values` per esplorare.
- Dimensioni: TERRITORIAL_LEVEL, REF_AREA, MEASURE, PRICES, UNIT_MEASURE
- Scelta `MEASURE=GDP`, `UNIT_MEASURE=USD_PPP_PS` (USD PPP per abitante), `PRICES=V` (valori correnti), `TERRITORIAL_LEVEL=TL2`.
- Codelist scaricate: `metadata/M_pil_oecd-meta-measure.csv`, `metadata/M_pil_oecd-meta-unit_measure.csv`

**N — OECD.CFE.EDS,DSD_REG_ECO@DF_LPR (produttività)**
- Dimensioni: TERRITORIAL_LEVEL, REF_AREA, MEASURE, ACTIVITY, PRICES, UNIT_MEASURE
- Scelta `MEASURE=LAB_PROD` (produttività del lavoro), `ACTIVITY=_T` (totale attività), `UNIT_MEASURE=USD_PPP_WR` (USD PPP per ora lavorata), `PRICES=V`.
- Codelist scaricate: `metadata/N_produttivita-meta-measure.csv`, `metadata/N_produttivita-meta-unit_measure.csv`, `metadata/N_produttivita-meta-activity.csv`

---

## 2026-04-29 — Fase 3: download dei dati

Tutti i download eseguiti via `opensdmx get` con filtri espliciti. Query salvate in `queries/`.

| File | Righe grezze | Anomalie rilevate |
|------|-------------|-------------------|
| A_pil_procapite.csv | 25 | — |
| B_occupazione.csv | 27 | — |
| C_disoccupazione.csv | 27 | — |
| D_inattivita.csv | 85 | 5 valori EDU_LEV_HIGHEST; serve filtro EDU_LEV_HIGHEST=99 |
| E_neet.csv | 26 | — |
| F_fertilita.csv | 35 | — |
| G_saldo_migratorio.csv | 14 | Lacuna 2001–2011; valori positivi 2021–2024 (anomalia metodologica) |
| H_migrazioni_interne.csv | 720 | 30 destinazioni per anno; serve filtro TERRITORY_NEXT_RESID=IT |
| I_s80s20.csv | 22 | — |
| J_arope.csv | 11 | Serie corta (2015–2025); solo 2 checkpoint quinquennali possibili |
| K_investimenti.csv | 360 | ~15 settori NACE per anno; serve filtro nace_r2=TOTAL |
| L_istruzione.csv | 26 | — |
| M_pil_oecd.csv | 25 | — |
| N_produttivita.csv | 22 | Serie chiusa al 2021 (ultimo dato OCSE disponibile) |

*(Le righe grezze non includono l'intestazione.)*

---

## 2026-04-29 — Double check (dataset Eurostat)

| Dataset | Run 1 (opensdmx CLI) | Run 2 (URL API diretto) | Risultato |
|---------|----------------------|------------------------|-----------|
| NAMA_10R_2GDP | 26 righe (incl. header) | 26 righe | ✓ MATCH |
| LFST_R_LFE2EMPRT | 28 righe | 28 righe | ✓ MATCH |
| LFST_R_LFU3RT | 28 righe | 28 righe | ✓ MATCH |
| EDAT_LFSE_22 | 27 righe | 27 righe | ✓ MATCH |
| DEMO_R_FIND2 | 36 righe | 36 righe | ✓ MATCH |
| ILC_DI11_R | 23 righe | 23 righe | ✓ MATCH |
| ILC_PEPS11N | 12 righe | 12 righe | ✓ MATCH |
| EDAT_LFSE_04 | 27 righe | 27 righe | ✓ MATCH |

Nota: `DEMO_R_GIND3` e `NAMA_10R_2GFCF` non inclusi nel double check URL perché il filtro multi-dimensionale produce URL troppo lungo/ambiguo; verificati con secondo `opensdmx get` usando filtri equivalenti → stesse righe.

ISTAT e OECD non espongono URL pubblici diretti equivalenti. Verifica effettuata ripetendo il comando CLI (`opensdmx get`) e confrontando conteggio righe → identico.

---

## 2026-04-29 — Fase 4: trasformazioni

Le trasformazioni sono tutte applicate in JavaScript inline nella pagina HTML. I CSV in `output/` non sono stati modificati.

**A — PIL pro capite**: nessuna trasformazione. 25 righe → 25 punti.

**B — Tasso occupazione**: nessuna trasformazione. 27 righe → 27 punti.

**C — Tasso disoccupazione**: nessuna trasformazione. 27 righe → 27 punti.

**D — Inattività**: filtro `EDU_LEV_HIGHEST=99` (totale) applicato in JS. 85 righe → 17 righe utili (2004–2020). Dataset ISTAT denominato "UNT2020" → serie chiusa metodologicamente al 2020.

**E — NEET**: nessuna trasformazione. 26 righe → 26 punti.

**F — Fertilità TFR**: nessuna trasformazione. 35 righe → 35 punti (1990–2024).

**G — Saldo migratorio**: nessuna trasformazione. 14 righe → 14 punti. Lacuna strutturale 2001–2011 documentata nel blocco trasformazioni della pagina HTML. Valori post-2021 positivi segnalati come potenziale artefatto metodologico.

**H — Emigrazione interna**: filtro `TERRITORY_NEXT_RESID=IT` applicato in JS. 720 righe → 24 righe utili (2002–2024, un valore per anno = emigrazione totale da Sicilia verso qualunque destinazione interna).

**I — S80/S20**: nessuna trasformazione. 22 righe → 22 punti (2004–2025).

**J — AROPE**: nessuna trasformazione. 11 righe → 11 punti (2015–2025).

**K — Investimenti fissi lordi**: filtro `nace_r2=TOTAL` applicato in JS. 360 righe → 24 righe utili (2000–2023). Valori in milioni di euro correnti.

**L — Istruzione terziaria**: nessuna trasformazione. 26 righe → 26 punti (2000–2025).

**M — PIL OECD**: nessuna trasformazione. 25 righe → 25 punti (2000–2024). Valori in USD PPP per abitante.

**N — Produttività**: nessuna trasformazione. 22 righe → 22 punti (2000–2021). Valori in USD PPP per ora lavorata.

---

## 2026-04-29 — Fase 5: scelte di visualizzazione

Tutti e 14 i grafici usano `chart.xkcd.XY` (serie temporale con linea continua) su contenitore `<svg>`. Motivazione: tutti gli indicatori sono serie temporali annuali per una singola entità geografica (Sicilia); il grafico XY con `showLine: true` è il tipo più adeguato.

`roughViz` non usato: adatto a ranking e confronti tra entità, non a serie temporali monoentità. `roughViz.Line` ha un bug noto nel callback `d3.csv` (perde `this`) che impedisce l'uso con dati inline.

Scelte cromatiche:
- Serie principale: `#b02020` (rosso) — colore unico per tutte le 14 serie (una sola entità per grafico).
- Nessun uso di colori secondari: nessuna multi-serie nei grafici.

Parametri uniformi: `dotSize: 0.4`, `xTickCount: 5`, `yTickCount: 4`. I valori `null` nel dataset JS (anni con dato mancante) sono esclusi via funzione `pts()` prima della costruzione del grafico.

Finding cards (4 numeri chiave selezionati per impatto narrativo):
- PIL index EU27=100: **61** (2024) → deterioramento strutturale in 25 anni
- Disoccupazione: **12,2%** (2025) → minimo storico ma ancora doppio della media UE
- NEET: **22,8%** (2025) → miglioramento recente ma ancora livello critico
- AROPE: **44%** (2025) → quasi uno su due a rischio povertà/esclusione

---

## 2026-04-29 — Checklist pre-pubblicazione

- [x] Ogni dataset Eurostat ha il blocco "Double check passed" in Metodologia (8/8 MATCH)
- [x] `notes.md` contiene tutte le fasi con comandi e decisioni
- [x] Ogni CSV in `output/` ha il file YAML corrispondente in `queries/` (14/14)
- [x] `metadata/` contiene 22 codelist CSV per le dimensioni filtrate/visualizzate
- [x] La pagina apre e i 14 grafici si renderizzano senza errori in console (verificato via Playwright)
- [x] `chart.xkcd` usa `<svg>` — tutti i 14 contenitori sono `<svg>` (verificato via DOM query)
- [x] Tutti i link `↓ CSV` puntano a `output/*.csv` (14 link presenti)
- [x] Gli URL API Eurostat nella sezione Metodologia sono presenti e cliccabili
- [x] Il blocco `.transform` è presente in ogni sezione dataset (14/14)
- [x] Data di generazione "29 aprile 2026" presente in: eyebrow header, callout Dati grezzi, footer
- [x] Sezione Dati grezzi indica data di estrazione e licenza (Eurostat CC BY 4.0 / OECD CC BY 3.0 / ISTAT CC BY 4.0)
- [x] Callout "Limite di scope" nella sezione Intro presente
- [x] Nessun `font-size` sotto `1rem` nel CSS
- [x] Nessun `font-size` sotto `1rem` nelle configurazioni JS (chart.xkcd non richiede `axisFontSize` esplicito — usa default interno)

