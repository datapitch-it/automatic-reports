# Report 14 — Rotte migratorie verso l'Europa (Ceuta) — Notes

## 2026-07-31 — Pista di ricerca e verifica preliminare

Testo fornito dall'utente: descrive una crisi a Ceuta 2026 con cifre molto specifiche
(~49.000–50.000 persone in 24 ore, ~60.000 totali pari al 70% della popolazione di
Ceuta, 43 morti, Sánchez in visita, ipotesi UE di sospensione Schengen, comitato di
sicurezza italiano).

**Verifica**: l'utente ha confermato che l'evento è realmente accaduto oggi, 31 luglio
2026, ed è riportato dai principali media europei — le cifre restano però provvisorie.
Nessun numero puntuale (50.000/24h, 60.000 totali, 43 morti) è riscontrabile nelle
serie SDMX Eurostat disponibili, che riportano solo aggregati annuali (MIGR_EIRFS) o
mensili (MIGR_ASYAPPCTZM) e sono pubblicate con un fisiologico ritardo di rilevazione —
non per un dubbio sulla veridicità dell'evento. Decisione: il testo/evento è trattato
come reale nel report, con nota esplicita che la portata numerica resta da confermare
nei dati ufficiali; il precedente più vicino già visibile nella serie è la crisi di
Ceuta di giugno 2021.

Fonti scartate per non-riproducibilità SDMX: Frontex Risk Analysis (dati per rotta più
specifici ma non SDMX), UNHCR Refugee Data Finder, IOM Missing Migrants Project.
OECD International Migration Database inizialmente esclusa su richiesta dell'utente
(restare su Eurostat); reintrodotta in un secondo momento su richiesta esplicita
dell'utente come sezione aggiuntiva in coda (vedi log del 2026-07-31 più sotto).

## 2026-07-31 — Data sources identified

- MIGR_EIRFS: cittadini di paesi terzi respinti alle frontiere esterne, annuale,
  dimensioni freq/border/unit/reason/citizen/geo. CORS n/a (fetch via opensdmx CLI,
  non browser).
- MIGR_ASYAPPCTZM: richiedenti asilo per cittadinanza, mensile, dimensioni
  freq/unit/citizen/sex/applicant/age/geo.
- Verificata presenza codice MA (Marocco) in entrambi i dataflow con
  `opensdmx constraints <id> citizen`.

## 2026-07-31 — Query e download

```
opensdmx get MIGR_EIRFS --border LAND+SEA --unit PER --reason TOTAL --citizen MA+TOTAL \
  --geo ES+IT+EL --start-period 2008 --end-period 2025 \
  --out output/refused_entry.csv --query-file queries/refused_entry.yaml
→ 200 righe dati (201 con header)

opensdmx get MIGR_ASYAPPCTZM --unit PER --citizen MA+TOTAL --sex T --applicant TOTAL \
  --age TOTAL --geo ES+IT+EL --start-period 2008 --end-period 2026 \
  --out output/asylum_applicants.csv --query-file queries/asylum_applicants.yaml
→ 1328 righe dati (1329 con header)
```

Nessun OBS_FLAG popolato in refused_entry.csv. In asylum_applicants.csv, flag `p`
(provvisorio) presente su alcune osservazioni 2025–2026, atteso per dati recenti.

## 2026-07-31 — Scoperta chiave durante l'esplorazione

Serie LAND/MA/ES (respingimenti terra Marocco→Spagna, Ceuta/Melilla) mostra un salto
strutturale: 483.285 (2019) → 155 (2020), crollo di oltre 3.000×, coincidente con le
chiusure di frontiera Covid-19. Il livello resta a poche centinaia da allora (180 nel
2025). Questo è il contro-dato principale rispetto alla narrazione di una "mega-crisi"
2026.

Serie MA/ES mensile (asilo) conferma un picco reale a giugno 2021 (1.065) — la crisi
di Ceuta documentata storicamente — con nessun picco comparabile nei mesi più recenti
disponibili (max 2025–2026: 595 a ott 2025).

## 2026-07-31 — Report costruito

- Libreria grafici: Chart.js (scelta esplicita dell'utente, coerente con
  `spec/charts.md`; nota per il team: gli ultimi due report pubblicati, 12 e 13,
  usano invece chart.xkcd — discrepanza segnalata ma non risolta in questo report).
- Sezioni: (A) respingimenti terra Ceuta/Melilla 2008–2025; (B) respingimenti mare
  ES/IT/EL 2008–2025; (C) richieste asilo Marocco mensile ES/IT/EL 2018–2026;
  (D) confronto rotte, totale richieste asilo tutte cittadinanze, annuale 2015–2025.
- Filtri: nessuno interattivo in questa versione (report statico, non dashboard con
  filtri live — struttura `reports/NN_slug/` seguendo la convenzione del progetto,
  non `dashboards/`).

## 2026-07-31 — Sezione E aggiunta: OECD International Migration Database

Su richiesta dell'utente, aggiunta in coda una quinta sezione con dati OECD.

- Dataflow: `OECD.ELS.IMD,DSD_MIG@DF_MIG` (International Migration Database),
  provider OECD. `opensdmx providers` conferma: constraints non supportato (✗),
  last_n supportato (✓). Esplorazione via `opensdmx info` + `opensdmx values`
  (REF_AREA, CITIZENSHIP, MEASURE, UNIT_MEASURE) invece del flusso standard
  `constraints`.
- Tentativi iniziali con REF_AREA=ESP/CITIZENSHIP=MAR/UNIT_MEASURE=NUMBER → HTTP 404
  ripetuto (con attese ~60s per chiamata, tipiche dell'API OECD). Risolto con una
  query wildcard di anteprima (`--REF_AREA . --CITIZENSHIP . ...`) che ha rivelato i
  codici corretti realmente usati dal dataflow: UNIT_MEASURE=`PS` (non `NUMBER`),
  BIRTH_PLACE=`_Z` e EDUCATION_LEV=`_Z` (non `_T`, "non applicabile" anziché "totale").
- Query finale: `REF_AREA=ESP+ITA+GRC, CITIZENSHIP=MAR, FREQ=A, MEASURE=B11
  (inflows of foreign population), SEX=_T, BIRTH_PLACE=_Z, EDUCATION_LEV=_Z,
  UNIT_MEASURE=PS` → 55 righe dati (56 con header), 1997–2023.
- Grecia (GRC): solo 2 osservazioni, entrambe nulle (2012, 2013) — serie non
  utilizzabile, esclusa dal grafico e segnalata nel testo.
- Nota metodologica: B11 misura ingressi regolari (lavoro/famiglia/studio/altri
  permessi legali), una famiglia di indicatori diversa e non direttamente
  comparabile ai respingimenti di frontiera (Eurostat MIGR_EIRFS) o alle richieste
  d'asilo (MIGR_ASYAPPCTZM) delle sezioni precedenti — usata come contesto
  strutturale di lungo periodo, non come prova diretta sull'evento di frontiera.
