# Note — Netherlands in Numbers: Fact-checking dell'infografica Eurostat

## Domanda di ricerca
Verificare la correttezza dei 6 indicatori statistici presenti nell'infografica Eurostat
"Netherlands in Numbers" (file: statistiche.jpeg), confrontandoli con i dati SDMX
più recenti disponibili via opensdmx CLI.

## Proxy statistica
Per ciascuno degli 8 valori dichiarati nell'immagine (6 indicatori, alcuni con NL+UE):
- ricercare il dataset SDMX corrispondente
- scaricare i dati più recenti
- confrontare il valore immagine con il valore SDMX

## Scope
I dati SDMX coprono le statistiche ufficiali Eurostat. Non coprono:
- le scelte editoriali dell'infografica (anno di riferimento, definizione esatta)
- eventuali aggiornamenti avvenuti dopo la data del dataset

## Provider candidati
- eurostat: constraints_supported=true, last_n_supported=true

---

## 27 aprile 2026 — Fase 1: ricerca dataset

```
opensdmx --output json providers
```
Provider selezionato: eurostat

Ricerche effettuate (opensdmx search + --provider eurostat):
- "population" → TPS00005 (Population as a % of EU27)
- "healthy life years" → TPS00150, SDG_03_11
- "employment rate 20-64" → TESEM010 (Employment rate by sex), LFSA_ERGAN
- "GDP per capita" → NAMA_10_PC, NAMA_10_GDP
- "internet access households" → ISOC_CI_IN_H, ISOC_CI_IT_H, ISOC_R_BROAD_H, TIN00134
- "WEEE waste electrical electronic" → CEI_WM060

Dataset selezionati:
| Indicatore immagine | Dataset | Motivo scelta |
|---|---|---|
| Popolazione totale NL | TPS00001 | Indicatore JAN diretto |
| % popolazione su UE | TPS00005 | Indicatore dedicato POPSHARE_EU27_2020 |
| Anni vita in salute | TPS00150 | Indicatore TPS dedicato per birth+sex |
| Tasso occupazione 20-64 | TESEM010 | Dataset specifico per employment rate by sex/age |
| PIL pro capite (€) | NAMA_10_PC | unit=CP_EUR_HAB |
| % PIL su UE | NAMA_10_GDP | unit=CP_MEUR, calcolo NL/EU27 |
| Internet ad alta velocità | ISOC_CI_IT_H | indic_is=H_BROAD (broadband), unico con NL+EU27 |
| Riciclo WEEE | CEI_WM060 | Dataset CEI dedicato tasso riciclo |

Dataset esclusi:
- SDG_03_11: stesso contenuto di TPS00150, scelto il più specifico
- LFSA_ERGAN: per citizenship, non per age group total
- ISOC_CI_IN_H: unit=PC_HH solo totale internet, non broadband specifico
- TIN00134: stessa limitazione di ISOC_CI_IN_H
- ISOC_R_BROAD_H: dataset NUTS, nessun aggregato EU27

---

## 27 aprile 2026 — Fase 2: esplorazione dimensioni e download

### TPS00005 — popolazione % UE
- indic_de: POPSHARE_EU27_2020 (trovata con opensdmx values)
- Risultati 2023-2025: sempre 4.0% (flag `be` o `ep` per 2024-2025)

### TPS00001 — popolazione totale NL
- Dimensione JAN (1 gennaio)
- 2025: 18.044.027 → arrotondato 18,0 milioni ✓

### TPS00150 — anni vita in salute alla nascita
- sex=T (totale), indic_he=HLY_0 (trovata con opensdmx values)
- Risultati più recenti: 2023 NL=59.0, EU27=63.1 (flag `bep` per EU)

### TESEM010 — tasso di occupazione 20-64
- age=Y20-64, sex=T, indic_em=EMP_LFS, unit=PC_POP
- Risultati 2025: NL=83.4%, EU=76.1%

### NAMA_10_PC — PIL pro capite
- unit=CP_EUR_HAB, na_item=B1GQ
- 2025 NL: €65.210 (flag `p` = provvisorio), EU: €41.620

### NAMA_10_GDP — PIL totale per calcolo quota UE
- unit=CP_MEUR, na_item=B1GQ
- 2025: NL=1.179.458 M€, EU27=18.810.682 M€ → quota = 6.27% ≈ 6.3%

### ISOC_CI_IT_H — internet ad alta velocità
- indic_is=H_BROAD (broadband), unit=PC_HH, hhtyp=TOTAL
- Ultimo anno disponibile: 2021 (NL=98.56%, EU=90.2%)
- CORRISPONDENZA IMMAGINE: 2017 (NL=97.8%→98%, EU=83.48%→83%)
- Dataset discontinuato: ultimo aggiornamento 2024 ma dati fermi al 2021

### CEI_WM060 — tasso riciclo WEEE
- unit=PC
- 2023: NL=80.5%, EU=82.2% (EU con flag `bi`)

---

## 27 aprile 2026 — Fase 3: analisi

### Risultati fact-check

| Dato immagine | Valore SDMX | Anno | Verdict |
|---|---|---|---|
| Popolazione 18,0 M | 18.044.027 | 2025 | ✅ CONFERMATO |
| 4,0% pop. UE | 4.0% | 2024-2025 | ✅ CONFERMATO |
| HLY NL = 59 anni | 59.0 anni | 2023 | ✅ CONFERMATO |
| HLY EU = 63 anni | 63.1 anni | 2023 (flag bep) | ✅ CONFERMATO (con caveat) |
| Occupazione NL = 83% | 83.4% | 2025 | ✅ CONFERMATO |
| Occupazione EU = 76% | 76.1% | 2025 | ✅ CONFERMATO |
| PIL pro capite €65.200 | €65.210 | 2025 (provv.) | ✅ CONFERMATO |
| PIL 6,3% del PIL UE | 6.27% | 2025 | ✅ CONFERMATO |
| Internet NL = 98% | 97.8% (H_BROAD 2017) / 98.56% (2021) | 2017 o 2021 | ⚠️ DATO OBSOLETO |
| Internet EU = 83% | 83.48% (H_BROAD 2017) / 90.2% (2021) | 2017 | ⚠️ DATO OBSOLETO |
| WEEE NL = 81% | 80.5% | 2023 | ⚠️ APPROSSIMAZIONE |
| WEEE EU = 82% | 82.2% | 2023 (flag bi) | ✅ CONFERMATO (con caveat) |

### Anomalie rilevate
1. Internet: il valore EU=83% corrisponde al 2017 (dataset ISOC_CI_IT_H discontinuato nel 2021).
   I dati più recenti mostrano EU=90.2% (2021) e totale internet EU=93% (2023).
   L'infografica usa un indicatore e un anno non più aggiornati.
2. HLY EU=63.1 ha flag bep (break in series + estimated + provisional) per il 2023.
3. PIL pro capite è provvisorio (flag p) per il 2025.
4. WEEE NL=80.5% → l'infografica arrotonda a 81% (arrotondamento per eccesso di .5).
