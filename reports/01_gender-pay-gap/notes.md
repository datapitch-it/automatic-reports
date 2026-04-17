# Note — Il divario retributivo di genere in Europa

## Domanda di ricerca
Quanto guadagnano le donne rispetto agli uomini in Europa?
Il divario retributivo di genere è cambiato nel tempo? Quali paesi hanno il divario maggiore e quali minore?

## Proxy statistica
Il Gender Pay Gap (GPG) non aggiustato: differenza percentuale tra la retribuzione oraria lorda
media degli uomini e quella delle donne, espressa in percentuale della retribuzione oraria lorda
media degli uomini. Formula: (retribuzione_uomini - retribuzione_donne) / retribuzione_uomini × 100.
Un valore di 15% significa che le donne guadagnano il 15% in meno degli uomini per ogni ora lavorata.

## Scope
I dati SDMX di Eurostat coprono il settore privato e semi-pubblico (B-S escluso O,
cioè industria, costruzioni e servizi esclusa la pubblica amministrazione).
NON coprono: lavoro nero e sommerso, lavoro di cura non retribuito,
differenze nel numero di ore lavorate su base annua.

## Provider candidati
- Eurostat (estat) — dataset TESEM180, EARN_GR_GPGR2AG, EARN_GR_GPGR2WT

---

## 2026-04-09 — Fase 0: lingua e domanda di ricerca
- Lingua selezionata: italiano
- Domanda fissata come sopra

## 2026-04-09 — Fase 1: ricerca dataset

### Comandi usati
```
opensdmx search "gender pay gap"
opensdmx search "earnings sex"
```

### Dataset trovati
- EARN_GR_GPG — GPG per NACE Rev. 1.1 (2002-2007) → escluso: obsoleto
- EARN_GR_GPGR2 — GPG per settore NACE Rev. 2 (2007-2024) → incluso per analisi settoriale
- EARN_GR_GPGR2AG — GPG per fascia d'età e settore (2007-2024) → incluso
- EARN_GR_GPGR2CT — GPG per tipo di proprietà → escluso: troppo specifico
- EARN_GR_GPGR2WT — GPG per orario di lavoro (part-time/full-time) → incluso
- EARN_GR_HGPG — GPG 1994-2006 → escluso: coperto da dataset più recenti
- TESEM180 — GPG non aggiustato, indicatore principale → incluso come dataset A
- SDG_05_20 — stessa struttura di TESEM180 ma con copertura 2002-2024 → escluso: sovrapposizione

### Dataset scelti
- **A**: TESEM180 — indicatore headline, 41 entità geo, 2007-2024
- **B**: EARN_GR_GPGR2AG — breakdown per fascia d'età, 36 paesi, 2007-2024
- **C**: EARN_GR_GPGR2WT — breakdown part-time vs full-time, 36 paesi, 2007-2024

## 2026-04-09 — Fase 2 e 3: esplorazione dimensioni e download

### TESEM180
- `opensdmx constraints TESEM180` → freq: A, unit: PC, nace_r2: B-S_X_O, geo: 41 entità
- geo include EU27_2020, EA20, EA21 (aggregati) e 38 paesi/candidati individuali
- Ultimi dati disponibili: 2024 per la maggior parte dei paesi EU (flag p = provvisorio)
- Nota: UK ha dati fino al 2018 (Brexit), TR fino al 2014, ME/MK/AL/RS fino al 2014-2018

### EARN_GR_GPGR2AG
- `opensdmx constraints EARN_GR_GPGR2AG age` → 6 fasce: Y_LT25, Y25-34, Y35-44, Y45-54, Y55-64, Y_GE65
- 36 paesi (solo UE + IS/NO/CH), no UK, no candidati Balcani

### EARN_GR_GPGR2WT
- `opensdmx constraints EARN_GR_GPGR2WT worktime` → PT (part-time), FT (full-time)
- 36 paesi, stessa copertura di EARN_GR_GPGR2AG

### Download eseguiti
- `opensdmx get TESEM180 --freq A --unit PC --nace_r2 B-S_X_O --start-period 2007 --end-period 2024 --out output/A_tesem180_gpg_overall.csv`
  → 584 righe, 39 entità geo, 2007–2024
- `opensdmx get EARN_GR_GPGR2AG --freq A --unit PC --start-period 2010 --end-period 2022 --out output/B_earn_gpg_age.csv`
  → 2099 righe, 36 paesi, 6 fasce d'età, 2010–2022
- `opensdmx get EARN_GR_GPGR2WT --freq A --unit PC --start-period 2010 --end-period 2022 --out output/C_earn_gpg_worktime.csv`
  → 602 righe, 36 paesi, 2 categorie orario (PT/FT), 2010–2022

## 2026-04-09 — Fase 4: trasformazioni

### Dataset A — Grafico ranking
- Selezionato ultimo anno disponibile per ogni paese (2024 per 30 paesi EU/SEE)
- Esclusi aggregati: EU27_2020, EA20, EA21, EA19
- Esclusi paesi non-UE/SEE con dati solo fino al 2014-2018: UK, TR, AL, RS, ME, MK
- Anomalie: CZ ha flag `dp` (definizione diversa + provvisorio) nel 2024
- Risultato: 30 paesi ordinati ascendente per GPG

### Dataset A — Grafico serie storica
- Selezionati 5 paesi (IT, DE, FR, ES, EE) + aggregato EU27_2020
- EU27_2020 disponibile solo dal 2010 (nessuna interpolazione per 2007-2009)
- Totale: 104 osservazioni

### Dataset B — Grafico per fascia d'età
- Filtrato per nace_r2=B-S_X_O e anno 2022
- Esclusi aggregati geografici e paesi non-EU/SEE
- Calcolata media semplice su 29 paesi con dati 2022
- Esclusa fascia Y_GE65 per scarsa copertura
- Risultato: 5 valori medi (una per fascia d'età)

## 2026-04-09 — Fase 5: grafici

- Grafico A: roughViz.BarH per ranking (confronto puntuale tra paesi)
- Grafico B: chart.xkcd.XY per serie storica (trend temporale multi-serie)
- Grafico C: roughViz.BarH per fascia d'età (confronto per categoria)
- roughViz.Line escluso per bug noto con d3.csv callback in v1.0.6
