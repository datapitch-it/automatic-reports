# Log estrazione e elaborazione dati — Ricerca SDMX Difesa

**Data**: 2026-04-08 | **Strumento**: opensdmx CLI | **Provider**: Eurostat, OECD

---

## 1. Discovery — Ricerca dataset

### 1.1 Strategia di ricerca

L'obiettivo era trovare dati statistici su spesa militare e industria della difesa.
I provider SDMX non pubblicano dati su singole aziende: la proxy migliore disponibile
è la **spesa governativa per la difesa** (COFOG classificazione funzioni della spesa).

Provider candidati valutati:
- **Eurostat** — dati europei, aggregati per paese
- **OECD** — copertura globale, inclusi USA, Giappone, Australia
- **SIPRI** — fonte primaria per industria armamenti, ma non espone API SDMX

### 1.2 Keyword testate su Eurostat

```bash
opensdmx search "defence"          # → 1 risultato: TSC00008 (R&D difesa)
opensdmx search "military"         # → 0 risultati
opensdmx search "arms"             # → 75 risultati: TUTTI falsi positivi (farms = aziende agricole)
opensdmx search "weapons"          # → 0 risultati
opensdmx search "defence spending" # → 0 risultati
opensdmx search "COFOG"            # → 3 risultati: GOV_10A_EXP ✓ (dataset principale)
```

**Risultato**: la keyword `arms` genera rumore (farms/arms = stesso stem).
La keyword `COFOG` è quella corretta perché i dataset di spesa pubblica usano
la classificazione COFOG, non il termine "defence" nel titolo.

### 1.3 Dataset identificati

| Dataset | Descrizione | Provider |
|---------|-------------|----------|
| `GOV_10A_EXP` | Spesa pubblica per funzione (COFOG) | Eurostat |
| `TSC00008` | % budget R&D governativo per difesa (GBARD) | Eurostat |
| `OECD.SDD.NAD,DSD_NASEC10@DF_TABLE11` | COFOG annuale paesi OECD | OECD |

---

## 2. Esplorazione struttura dataset

### 2.1 GOV_10A_EXP — struttura dimensioni

```bash
opensdmx info GOV_10A_EXP
```

**Dimensioni** (ordine obbligatorio per costruire la query):

| Posizione | Dimensione | Codelist | Descrizione |
|-----------|-----------|----------|-------------|
| 1 | `freq` | FREQ | Frequenza temporale |
| 2 | `unit` | UNIT | Unità di misura |
| 3 | `sector` | SECTOR | Settore istituzionale |
| 4 | `cofog99` | COFOG99 | Funzione di governo (COFOG 1999) |
| 5 | `na_item` | NA_ITEM | Voce contabile (ESA 2010) |
| 6 | `geo` | GEO | Paese |

### 2.2 Constraints GOV_10A_EXP — valori effettivamente presenti

```bash
opensdmx constraints GOV_10A_EXP
```

| Dimensione | N. valori disponibili | Campione |
|-----------|----------------------|---------|
| `freq` | 1 | A (annuale) |
| `unit` | 4 | MIO_EUR, MIO_NAC, PC_GDP |
| `sector` | 5 | S13, S1311, S1312, S1313, S1314 |
| `cofog99` | 80 | TOTAL, GF01, GF0201... |
| `na_item` | 32 | P2, P3, TE... |
| `geo` | 34 | EU27_2020, EA21, IT, PL... |
| `TIME_PERIOD` | 35 anni | 1990–2024 |

**Scoperta critica**: Germania (`DE`) e Francia (`FR`) **non presenti** tra i 34 paesi disponibili.
Eurostat non riceve questi dati da DE e FR per questo dataset specifico.
Paesi presenti: EU27 esclusi DE, FR + Svizzera, Norvegia, Islanda.

### 2.3 Codici COFOG per la difesa

```bash
opensdmx constraints GOV_10A_EXP cofog99 | grep -i "GF02\|defence"
```

| Codice | Label |
|--------|-------|
| `GF02` | Defence (totale) |
| `GF0201` | **Military defence** ← usato |
| `GF0202` | Civil defence |
| `GF0203` | Foreign military aid |
| `GF0204` | R&D Defence |
| `GF0205` | Defence n.e.c. |

**Scelta**: `GF0201` (difesa militare) invece di `GF02` (aggregato totale) per:
- Escludere difesa civile (protezione civile) che non riguarda l'industria degli armamenti
- Escludere aiuti militari esteri (trasferimenti, non produzione)
- Confrontabilità internazionale: GF0201 è la voce standard NATO

### 2.4 Scelta delle unità di misura

Unità disponibili: `MIO_EUR`, `MIO_NAC` (valuta nazionale), `PC_GDP` (% PIL).

**Scelta**: `PC_GDP` per Eurostat perché:
- Normalizza per dimensione dell'economia → confronto internazionale corretto
- Non influenzato da variazioni dei tassi di cambio
- Standard usato da NATO e ricerca comparata

`MIO_EUR` scartata: favorisce paesi grandi, Germania/Francia dominerebbero.

### 2.5 TSC00008 — struttura e constraints

```bash
opensdmx info TSC00008
opensdmx constraints TSC00008
```

**Dimensioni**: freq · nabs07 · unit · geo

| Dimensione | Valori | Nota |
|-----------|--------|------|
| `freq` | A (1) | Solo annuale |
| `nabs07` | 3 | NABS14 (difesa), TOTALXNABS14 (civile), TOTAL |
| `unit` | PC_GBA (1) | % del budget R&D governativo totale |
| `geo` | 46 paesi | Include US, KR, UK, JP (assenti da GOV_10A_EXP) |
| TIME_PERIOD | 2014–2025 | 12 anni |

**Cosa misura**: GBARD (Government Budget Appropriations or Outlays for R&D)
= stanziamenti di bilancio per R&D, non la spesa effettiva realizzata.
Codice `NABS14` = difesa nel sistema NABS 2007.

**Valore aggiunto rispetto a GOV_10A_EXP**: include USA, Corea del Sud, UK, Giappone,
Turchia — paesi assenti o incompleti nel dataset COFOG europeo.

---

## 3. Download dati — Fase A

**Obiettivo**: spesa militare (% PIL) per tutti i paesi europei disponibili, 2000–2024.

```bash
opensdmx get GOV_10A_EXP \
  --unit PC_GDP \
  --sector S13 \
  --cofog99 GF0201 \
  --na_item TE \
  --geo . \
  --start-period 2000 --end-period 2024 \
  --out output/A_spesa_militare_pil_eu.csv
```

**Filtri e motivazioni**:
- `sector=S13` — governo generale (centrale + locale + previdenziale): livello più comparabile
- `na_item=TE` — Total Expenditure: spesa totale (non solo consumi intermedi o investimenti)
- `geo=.` — wildcard: tutti i paesi presenti nei constraints

**Risultato**:
- 660 righe (header escluso)
- 27 paesi × ~25 anni (non tutti i paesi hanno dati per tutti gli anni)
- Periodo effettivo: 2000–2024 (alcuni paesi iniziano dal 2001)

**Colonne nel CSV**:

| Colonna | Tipo | Valori osservati |
|---------|------|-----------------|
| `DATAFLOW` | string | `ESTAT:GOV_10A_EXP(1.0)` |
| `LAST UPDATE` | datetime | 27/03/26 23:00:00 |
| `freq` | string | sempre `A` |
| `unit` | string | sempre `PC_GDP` |
| `sector` | string | sempre `S13` |
| `cofog99` | string | sempre `GF0201` |
| `na_item` | string | sempre `TE` |
| `geo` | string | codice ISO alpha-2 (IT, PL, EE...) |
| `TIME_PERIOD` | date | formato YYYY-01-01 |
| `OBS_VALUE` | float | range: -0.1 (SK) → 3.6 (EE) |
| `OBS_FLAG` | string | `p` = provvisorio, vuoto = definitivo |
| `CONF_STATUS` | string | sempre vuoto (dati pubblici) |

**Anomalie trovate**:
- **Slovacchia 2023**: `OBS_VALUE = -0.1` con `OBS_FLAG` vuoto. Valore negativo causato da
  rettifiche contabili retrospettive (rimborsi, riclassificazioni). Non un errore — riflette
  movimenti contabili in quell'anno. Escluso dalla visualizzazione BarH (non renderizzabile
  come barra orizzontale negativa) ma presente nel CSV grezzo.
- **Anno mancante 2000**: alcuni paesi (IT, PL, EL, SE) non hanno dato per il 2000.
  La serie inizia dal 2001 per questi paesi.

---

## 4. Download dati — Fase B

**Obiettivo**: serie storica per paesi con profili strategici diversi.

**Primo tentativo** (fallito):
```bash
opensdmx get GOV_10A_EXP [...] --geo IT+DE+FR+PL+ES+SE
```
→ DE e FR hanno restituito 0 righe. Confermato da constraints: non presenti nel dataset.

**Secondo tentativo** (successo):
```bash
opensdmx get GOV_10A_EXP \
  --unit PC_GDP --sector S13 --cofog99 GF0201 --na_item TE \
  --geo IT+PL+ES+SE+EE+EL+NO \
  --start-period 2000 --end-period 2024 \
  --out output/B_spesa_militare_paesi_selezionati.csv
```

**Criteri di selezione paesi**:
- `EE` (Estonia) — confine diretto con Russia, massima crescita post-2022
- `EL` (Grecia) — storicamente tra le più alte spese in % PIL (contenzioso con Turchia)
- `PL` (Polonia) — accelerazione marcata dopo invasione Ucraina 2022
- `NO` (Norvegia) — paese NATO non-UE, punto di riferimento nordico
- `SE` (Svezia) — entrata NATO 2024 dopo decenni di neutralità, trend visibile
- `IT` (Italia) — caso di riferimento per l'autore, stabile ma sotto target NATO 2%
- `ES` (Spagna) — tra i più bassi in Europa, sotto pressione per obiettivo 2%

**Risultato**: 7 paesi × ~24 anni = ~168 righe attese.
Effettivo: serie complete per tutti i paesi tranne gap per anno 2000 su alcuni.

**Osservazioni empiriche dai dati**:
- Estonia: 1.1% (2000) → 1.7% (2015) → **3.6% (2024)** — crescita +227% dal 2000
- Grecia: 3.7% (2003, picco) → 2.1% (2024) — unico paese con trend decrescente
- Polonia: 1.5% (2001–2007 stabile) → 1.9% (2023) — accelerazione dal 2022
- Svezia: 1.8% (2001) → 1.0% (2015–2019, minimo storico) → 1.7% (2024) — V-shape
- Italia: 1.1–1.3% per 24 anni — dataset mostra stabilità quasi piatta
- Spagna: scende da 1.0% (2000) a 0.7% (2014) → risale a 0.7% (2024) — non recupera

---

## 5. Download dati — Fase C

**Obiettivo**: quota R&D governativo destinata alla difesa, confronto globale.

```bash
opensdmx get TSC00008 \
  --nabs07 NABS14 \
  --unit PC_GBA \
  --geo . \
  --start-period 2014 --end-period 2025 \
  --out output/C_rd_difesa.csv
```

**Risultato**: 39 paesi con almeno un anno di dato disponibile.

**Colonne nel CSV**:

| Colonna | Valori osservati |
|---------|-----------------|
| `nabs07` | sempre `NABS14` |
| `unit` | sempre `PC_GBA` |
| `geo` | ISO alpha-2 + codici non-UE (US, KR, UK, JP, TR, AL, RS, ME, BA) |
| `OBS_VALUE` | range: 0.0 (MT, CY, IS, IE, BA) → 52.3 (US, 2024) |
| `OBS_FLAG` | `d` = definizione divergente; `p` = provvisorio |

**Flag `d` (definition differs)**: presente per alcune osservazioni di Austria e altri.
Indica che il paese ha usato una metodologia leggermente diversa per quella voce.
Non compromette la comparabilità a livello macro.

**Elaborazione post-download** (Python):
- Estratto ultimo anno disponibile per ciascun paese (variabile: 2021–2025)
- Esclusi codici aggregati: `EU27_2020`, `EA21`, `EA20`, `EA19`
- Paesi esclusi dal grafico "europeo": US, KR, UK (=GB nel dataset), JP, AL, RS, ME, BA, TR
  → mantenuti nel grafico globale

**Ranking completo (ultimo anno disponibile)**:

| Paese | % GBARD difesa | Anno |
|-------|---------------|------|
| USA | 52.3% | 2024 |
| Corea del Sud | 15.9% | 2023 |
| UK | 13.1% | 2021 |
| Francia | 7.8% | 2024 |
| Germania | 7.6% | 2024 |
| Polonia | 6.2% | 2024 |
| Romania | 5.7% | 2024 |
| Albania | 5.2% | 2023 |
| Norvegia | 4.5% | 2025 |
| Lussemburgo | 4.4% | 2024 |
| Italia | 0.6% | 2024 |
| Cipro, Bosnia, Irlanda, Islanda, Malta | 0.0% | vari |

---

## 6. Esplorazione e download — Fase D (OECD)

### 6.1 Ricerca dataset OECD

```bash
opensdmx search "government expenditure" --provider oecd
```

→ 13 risultati. Candidati valutati:

| Dataset | Esito |
|---------|-------|
| `OECD.CFE.RDG,DSD_DASHBOARD@COFOG` | Scartato: spesa **subnazionale** (non governo centrale) |
| `OECD.SDD.NAD,DSD_NASEC10@DF_TABLE11` | **Scelto**: COFOG annuale governo generale ✓ |
| `OECD.SDD.NAD,DSD_NASEC10_IDC@DF_TABLE11_IDC` | Scartato: dataset inter-country (flussi bilaterali) |

### 6.2 Struttura OECD DF_TABLE11

```bash
opensdmx info "OECD.SDD.NAD,DSD_NASEC10@DF_TABLE11" --provider oecd
```

**13 dimensioni** (più complesso di Eurostat):

| Posizione | Dimensione | Descrizione |
|-----------|-----------|-------------|
| 1 | FREQ | Frequenza |
| 2 | REF_AREA | Paese (ISO alpha-3) |
| 3 | SECTOR | Settore |
| 4 | COUNTERPART_SECTOR | Settore controparte |
| 5 | ACCOUNTING_ENTRY | Voce contabile |
| 6 | TRANSACTION | Tipo transazione |
| 7 | INSTR_ASSET | Strumento/asset |
| 8 | EXPENDITURE | Funzione COFOG |
| 9 | UNIT_MEASURE | Unità |
| 10 | VALUATION | Metodo valutazione |
| 11 | PRICE_BASE | Base prezzi |
| 12 | TRANSFORMATION | Trasformazione |
| 13 | TABLE_IDENTIFIER | ID tabella contabile |

### 6.3 Ricerca codici paese — scoperta formato

```bash
opensdmx values "OECD.SDD.NAD,DSD_NASEC10@DF_TABLE11" REF_AREA --provider oecd \
  | grep -E "Germany|France|Italy|Japan|United States"
```

**Scoperta**: la codelist REF_AREA contiene sia codici **numerici SDG** (840 = USA, 276 = Germania)
sia codici **ISO alpha-3** (DEU, FRA, GBR). Il dataset OECD usa ISO alpha-3 per i paesi OCSE.

Tentativi con codici numerici (840 = USA) → **HTTP 404**.
Tentativo con `DEU`, `FRA`, `GBR` → **HTTP 404**.

Query con soli wildcard per diagnosticare:
```bash
opensdmx get "OECD.SDD.NAD,DSD_NASEC10@DF_TABLE11" --provider oecd \
  --EXPENDITURE GF0201 --last-n 1
```
→ 2749 righe. **Paesi trovati nel dataset**: BGR, AUS, AUT, BEL, CHE, COL, CRI, CZE, DEU,
DNK, EA20, ESP, EST, EU27_2020, FIN, FRA, GBR, GRC, HRV, HUN, IRL, ISL, ISR, ITA, JPN,
LTU, LUX, LVA, NLD, NOR + altri.

**Scoperta**: DEU e FRA sono presenti in OECD ma non in Eurostat — sono i paesi di maggiore
interesse che mancavano nella Fase A.

**Scoperta**: **USA** e **Corea del Sud** (KOR) non presenti in questo dataset OECD.
Coperti solo indirettamente tramite TSC00008 (R&D difesa, Fase C).

### 6.4 Identificazione transazione corretta

```bash
opensdmx get "OECD.SDD.NAD,DSD_NASEC10@DF_TABLE11" --provider oecd \
  --EXPENDITURE GF0201 --last-n 1 \
  | python3 -c "... | set(r['TRANSACTION'] for r in rows)"
```

Transazioni disponibili per GF0201: `D1, D3, D4, D62, D632, D6M, D7, D9, D92, NP, OEC, OED, **OTE**, P2, P3, P31, P32, P5, P51G, P5L`

Scelta `OTE` (Other Total Expenditure) come aggregato di spesa totale — equivalente a `TE` usato in Eurostat.

### 6.5 Problema unità di misura — scelta della normalizzazione

OECD DF_TABLE11 espone solo `XDC` (valuta nazionale corrente).
Non disponibile `PC_GDP` (% PIL) come in Eurostat.

**Problema**: confronto diretto tra paesi impossibile (EUR vs GBP vs JPY vs PLN).

**Soluzione**: **Indice 2015=100** calcolato in Python post-download:
```python
base = data[geo][2015]
index[geo][year] = data[geo][year] / base * 100
```

Questo mostra la **crescita relativa** a parità di anno base, indipendentemente dalla valuta.
2015 scelto come anno base perché: precedente all'invasione Ucraina 2022, rappresentativo
del periodo "pace post-2008", usato come baseline in molte analisi NATO.

### 6.6 Query finale e download

```bash
opensdmx get "OECD.SDD.NAD,DSD_NASEC10@DF_TABLE11" --provider oecd \
  --FREQ A \
  --REF_AREA "DEU+FRA+GBR+JPN+ITA+POL+ESP+SWE+NOR" \
  --SECTOR S13 \
  --EXPENDITURE GF0201 \
  --TRANSACTION OTE \
  --start-period 2005 --end-period 2024 \
  --out output/D_spesa_militare_oecd.csv
```

**Risultato**: 198 righe · 9 paesi · 2005–2024.

**Colonne rilevanti**:

| Colonna | Valori | Note |
|---------|--------|------|
| `REF_AREA` | DEU, FRA, GBR... | ISO alpha-3 |
| `UNIT_MEASURE` | XDC | Valuta nazionale corrente |
| `UNIT_MULT` | 6 | Valori in milioni (10^6) |
| `OBS_VALUE` | es. 44898 per DEU 2024 | → 44.898 miliardi di EUR |
| `OBS_STATUS` | A = normale, P = provvisorio | |
| `CURRENCY` | EUR, GBP, JPY... | Valuta del paese |

**Australia (AUS)**: tutti i valori `OBS_VALUE = 0` — dato non comunicato o non rilevato
da OECD per questa specifica voce. Esclusa dall'analisi.

### 6.7 Elaborazione indice 2015=100

```python
data = {}  # {geo: {year: value}}
for r in rows:
    v = float(r['OBS_VALUE']) * (10 ** int(r['UNIT_MULT']))
    if v > 0:
        data[geo][year] = v

# Indice
for geo in data:
    base = data[geo][2015]  # o primo anno se 2015 mancante
    for year in data[geo]:
        index[geo][year] = round(data[geo][year] / base * 100, 1)
```

**Risultati indice 2015→2024 (o ultimo disponibile)**:

| Paese | Indice | Anno | Var. % |
|-------|--------|------|--------|
| Svezia | 249.2 | 2024 | +149% |
| Polonia | 235.4 | 2023 | +135% |
| Norvegia | 225.8 | 2024 | +126% |
| Germania | 177.2 | 2024 | +77% |
| Giappone | 172.6 | 2024 | +73% |
| UK | 163.2 | 2024 | +63% |
| Francia | 144.5 | 2024 | +45% |
| Italia | 141.5 | 2024 | +42% |
| Spagna | 127.7 | 2024 | +28% |

---

## 7. Metadati

### 7.1 Codelist COFOG estratta

```bash
opensdmx --output json constraints GOV_10A_EXP cofog99 \
  | python3 -c "... salva metadata/cofog99_codes.csv"
```

→ 80 codici COFOG con label in inglese salvati in `metadata/cofog99_codes.csv`.

### 7.2 Query YAML per riproducibilità

```bash
# Genera file YAML che cattura provider, dataset, filtri, periodo
opensdmx get GOV_10A_EXP [filtri A] --query-file spesa_militare_eu_pil.yaml
opensdmx get TSC00008 [filtri C] --query-file rd_difesa_eurostat.yaml
```

Per rieseguire: `opensdmx run spesa_militare_eu_pil.yaml --out output/refresh.csv`

---

## 8. Riepilogo file dati prodotti

| File | Righe | Paesi | Periodo | Fonte |
|------|-------|-------|---------|-------|
| `output/A_spesa_militare_pil_eu.csv` | 660 | 27 | 2000–2024 | Eurostat GOV_10A_EXP |
| `output/B_spesa_militare_paesi_selezionati.csv` | ~168 | 7 | 2000–2024 | Eurostat GOV_10A_EXP |
| `output/C_rd_difesa.csv` | ~390 | 39 | 2014–2025 | Eurostat TSC00008 |
| `output/D_spesa_militare_oecd.csv` | 198 | 9 | 2005–2024 | OECD NASEC10 |
| `metadata/cofog99_codes.csv` | 80 | — | — | Eurostat codelist |

---

## 9. Limiti e caveat dei dati

**Confrontabilità Eurostat vs OECD**: GOV_10A_EXP e DF_TABLE11 usano la stessa classificazione
COFOG ma metodologie SEC contabili leggermente diverse. Non sommare o confrontare direttamente
i valori assoluti dei due dataset.

**Germania e Francia assenti da Eurostat**: non riportano dati a Eurostat per GOV_10A_EXP.
Per questi paesi usare esclusivamente i dati OECD (Fase D).

**GBARD ≠ spesa effettiva**: TSC00008 misura stanziamenti di bilancio, non esborsi reali.
La spesa effettiva per R&D militare può differire per ritardi di esecuzione o variazioni
politiche infra-annuali.

**Ritardi di pubblicazione**: dati 2023 e 2024 spesso provvisori (flag `p`). Verificare
sempre la data di ultimo aggiornamento (`LAST UPDATE` nel CSV).

**USA e Corea del Sud**: non coperti da COFOG OECD DF_TABLE11. Disponibili solo per R&D
difesa (TSC00008). Dati di spesa militare totale USA/KOR disponibili da SIPRI ma non in SDMX.
