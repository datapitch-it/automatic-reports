# Ricerca SDMX — Spesa militare e industria della difesa

**Data**: 2026-04-08 | **Strumento**: opensdmx CLI | **Provider**: Eurostat, OECD

---

## Scope e limiti

Questa ricerca usa dati statistici istituzionali (SDMX). I provider SDMX pubblicano
**aggregati macroeconomici** — non dati su singole aziende. Per dati su aziende
specifiche (BAE Systems, Leonardo, Rheinmetall, ecc.) la fonte è il
[SIPRI Arms Industry Database](https://www.sipri.org/databases/armsindustry),
non disponibile via SDMX.

I dati qui raccolti misurano la **domanda pubblica di difesa** (spesa governativa),
che è la proxy statistica più affidabile disponibile in formato aperto.

---

## File prodotti

| File | Contenuto | Fonte |
|------|-----------|-------|
| `output/A_spesa_militare_pil_eu.csv` | Spesa militare % PIL · 27 paesi · 2000–2024 | Eurostat GOV_10A_EXP |
| `output/B_spesa_militare_paesi_selezionati.csv` | 7 paesi selezionati (IT, PL, ES, SE, EE, EL, NO) | Eurostat GOV_10A_EXP |
| `output/C_rd_difesa.csv` | R&D per difesa % budget R&D gov. · 39 paesi · 2014–2025 | Eurostat TSC00008 |
| `output/D_spesa_militare_oecd.csv` | Spesa militare valuta locale · 9 paesi · 2005–2024 | OECD NASEC10 |
| `charts/A_spesa_militare_paesi_eu.html` | Ranking EU ultimo anno (roughViz BarH) | — |
| `charts/B_serie_storica_paesi.html` | Serie storica small multiples (roughViz Line) | — |
| `charts/C_rd_difesa.html` | Ranking R&D difesa (chart.xkcd Bar) | — |
| `charts/D_confronto_globale_oecd.html` | Crescita relativa indice 2015=100 (chart.xkcd XY) | — |
| `metadata/cofog99_codes.csv` | Codelist COFOG 1999 — 80 codici con label | Eurostat |
| `spesa_militare_eu_pil.yaml` | Query riproducibile Fase A | — |
| `rd_difesa_eurostat.yaml` | Query riproducibile Fase C | — |

---

## Dataset A — Spesa militare EU (GOV_10A_EXP)

**Fonte SDMX**: `ESTAT:GOV_10A_EXP(1.0)`  
**URL download**:
```
https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/GOV_10A_EXP/A.PC_GDP.S13.GF0201.TE./ALL/?startPeriod=2000&endPeriod=2024&format=SDMX-CSV
```
**Riproduci con**: `opensdmx run spesa_militare_eu_pil.yaml`

### Schema colonne (output/A_spesa_militare_pil_eu.csv)

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `freq` | string | Frequenza — sempre `A` (annuale) |
| `unit` | string | Unità — `PC_GDP` = percentuale del PIL |
| `sector` | string | Settore — `S13` = governo generale (centrale + locale + previdenziale) |
| `cofog99` | string | Funzione COFOG — `GF0201` = difesa militare |
| `na_item` | string | Voce contabile — `TE` = spesa totale |
| `geo` | string | Codice paese ISO 3166-1 alpha-2 |
| `TIME_PERIOD` | date | Anno (formato YYYY-01-01) |
| `OBS_VALUE` | float | Valore osservato (% PIL) |
| `OBS_FLAG` | string | Flag qualità: `p` = provvisorio, vuoto = definitivo |
| `CONF_STATUS` | string | Confidenzialità — vuoto = pubblico |

### Filtri applicati
- Unità: `PC_GDP` (% PIL) — scelta per comparabilità internazionale
- Settore: `S13` (governo generale) — include tutti i livelli di governo
- COFOG: `GF0201` (difesa militare) — esclude difesa civile e aiuti militari esteri
- Transazione: `TE` (spesa totale)

### Copertura
- 27 paesi: EU27 esclusi DE e FR (non presenti nel dataset) + CH, NO, IS
- **⚠ Assenti**: Germania e Francia — non riportano dati in GOV_10A_EXP
- Periodo: 2000–2024 (25 anni), alcuni paesi iniziano da 2001
- Ultimo aggiornamento dataset: 27/03/2026

---

## Dataset B — Paesi selezionati (GOV_10A_EXP filtrato)

Stessa fonte di A, filtrato su 7 paesi di interesse:
`IT` (Italia), `PL` (Polonia), `ES` (Spagna), `SE` (Svezia), `EE` (Estonia), `EL` (Grecia), `NO` (Norvegia).

Scelta motivata: rappresentano diversi profili strategici (paesi di confine est, mediterraneo, neutri storici).

---

## Dataset C — R&D per la difesa (TSC00008)

**Fonte SDMX**: `ESTAT:TSC00008(1.0)`  
**URL download**:
```
https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/TSC00008/A.NABS14.PC_GBA./ALL/?startPeriod=2014&endPeriod=2025&format=SDMX-CSV
```
**Riproduci con**: `opensdmx run rd_difesa_eurostat.yaml`

### Che cos'è il GBARD
Il **Government Budget Appropriations or Outlays for R&D** (GBARD) misura gli
*stanziamenti di bilancio* per R&D — non la spesa effettiva realizzata.
Il valore `PC_GBA` indica la percentuale del budget R&D governativo totale
destinata alla difesa (codice NABS2007: `NABS14`).

### Schema colonne (output/C_rd_difesa.csv)

| Colonna | Tipo | Descrizione |
|---------|------|-------------|
| `nabs07` | string | Categoria NABS 2007 — `NABS14` = difesa |
| `unit` | string | `PC_GBA` = % del budget R&D governativo totale |
| `geo` | string | Codice paese (include non-UE: US, KR, UK, JP, TR) |
| `TIME_PERIOD` | date | Anno |
| `OBS_VALUE` | float | % GBARD allocato alla difesa |
| `OBS_FLAG` | string | `d` = definizione diversa; `p` = provvisorio |

### Valori notevoli (ultimo anno disponibile)
| Paese | % GBARD difesa | Anno |
|-------|---------------|------|
| USA | 52.3% | 2024 |
| Corea del Sud | 15.9% | 2023 |
| UK | 13.1% | 2021 |
| Francia | 7.8% | 2024 |
| Germania | 7.6% | 2024 |
| Italia | 0.6% | 2024 |

---

## Dataset D — Confronto globale OECD (NASEC10 DF_TABLE11)

**Fonte SDMX**: `OECD.SDD.NAD:DSD_NASEC10@DF_TABLE11(1.1)` (provider: OECD)

### Nota metodologica
Il dataset OECD riporta i dati in **valuta nazionale corrente** (XDC), non in % PIL.
Il confronto diretto tra paesi è quindi impossibile senza dati PIL.
I grafici usano un **indice 2015=100** che mostra la crescita *relativa* della spesa:
un valore di 200 significa che la spesa è raddoppiata rispetto al 2015.

### Filtri applicati
- Settore: `S13` (governo generale)
- Transazione: `OTE` (total expenditure — spesa totale)
- COFOG: `GF0201` (difesa militare)
- Paesi: DEU, FRA, GBR, JPN, ITA, POL, ESP, SWE, NOR · 2005–2024

### Disponibilità paesi OECD per GF0201
| Paese | Disponibile | Note |
|-------|-------------|------|
| Germania (DEU) | ✓ | Assente in Eurostat — solo via OECD |
| Francia (FRA) | ✓ | Assente in Eurostat — solo via OECD |
| UK (GBR) | ✓ | |
| Giappone (JPN) | ✓ | |
| Australia (AUS) | ✗ | Valori zero nel dataset |
| USA | ✗ | Non presente in DF_TABLE11 |
| Corea del Sud (KOR) | ✗ | Non presente in DF_TABLE11 |

---

## Legenda flag

| Flag | Significato | Provider |
|------|-------------|----------|
| `p` | Provvisorio (preliminary) | Eurostat |
| `d` | Definizione diversa dalla standard | Eurostat |
| `b` | Interruzione di serie | Eurostat |
| `A` | Dato normale | OECD |
| `P` | Provvisorio | OECD |

---

## Riproducibilità

```bash
# Riesegui Fase A
opensdmx run spesa_militare_eu_pil.yaml --out output/A_refresh.csv

# Riesegui Fase C
opensdmx run rd_difesa_eurostat.yaml --out output/C_refresh.csv

# Riesegui Fase D manuale
opensdmx get "OECD.SDD.NAD,DSD_NASEC10@DF_TABLE11" --provider oecd \
  --FREQ A --REF_AREA "DEU+FRA+GBR+JPN+ITA+POL+ESP+SWE+NOR" \
  --SECTOR S13 --EXPENDITURE GF0201 --TRANSACTION OTE \
  --start-period 2005 --end-period 2024 \
  --out output/D_spesa_militare_oecd.csv
```

---

## Librerie grafici

- **[roughViz](https://github.com/jwilber/roughViz)** v1.0.6 — grafici in stile schizzo (BarH, Line)
- **[chart.xkcd](https://github.com/timqian/chart.xkcd)** v1.1 — grafici in stile xkcd (Bar, XY Line)

Tutti i grafici sono file HTML standalone con dati incorporati — non richiedono server.
