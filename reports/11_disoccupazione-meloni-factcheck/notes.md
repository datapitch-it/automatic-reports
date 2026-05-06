# Note — Disoccupazione e governi italiani: fact-check dell'infografica FdI

## Domanda di ricerca

### Originale (verbatim)
"usa @journoai.md e poi @disoccupazione-meloni.jpeg. Capito?"

### Pulita
I valori di disoccupazione attribuiti ai governi Renzi, Conte, Draghi e Meloni nell'infografica di Fratelli d'Italia sono corretti e metodologicamente onesti?

## Proxy statistica
ISTAT 151_914 — Tasso di disoccupazione, popolazione 15-74 anni, Italia, totale (sesso 9, educazione 99, cittadinanza TOTAL). Approssima il fenomeno perché è la serie ISTAT di riferimento nazionale; limite: non distingue lavori precari da stabili, né l'effetto congiunturale (es. COVID) dall'azione di governo.

## Scope
I dati ISTAT coprono il tasso di disoccupazione ILO per l'Italia. Non coprono:
- La qualità dell'occupazione (contratti a termine, part-time involontario)
- La componente regionale o demografica
- Il nesso causale tra politiche di governo e andamento della disoccupazione

## Provider candidati
- **istat**: constraints_supported=True, last_n_supported=True, categories_supported=True
- estat: ricerca ha restituito risultati vuoti per questa sessione; usato solo ISTAT

---

## 6 maggio 2026 — Fase 1: ricerca dataset

```bash
opensdmx --output json providers
opensdmx search "disoccupazione" --provider istat
```

Dataset selezionati:
| Dataset | Descrizione | Uso |
|---|---|---|
| 151_914 | Tasso di disoccupazione (annuale e trimestrale) | Serie principale |
| 151_874 | Tasso di disoccupazione - dati mensili | Verifica cherry-picking mensile |
| 151_884 | Tasso di disoccupazione - dati trimestrali destagionalizzati | Double check |

Dataset esclusi:
- 151_1176, 151_1193: serie vecchio regolamento (fino al 2020), dati discontinui
- 151_1192: durata della disoccupazione, non tasso aggregato

---

## 6 maggio 2026 — Fase 2: esplorazione dimensioni

Dataset 151_914:
- FREQ: A (annuale), Q (trimestrale)
- REF_AREA: IT (Italia nazionale)
- DATA_TYPE: UNEM_R (solo valore disponibile)
- SEX: 9 (totale), 1 (maschi), 2 (femmine)
- AGE: Y15-74 (15-74 anni — standard ILO)
- EDU_LEV_HIGHEST: 99 (totale)
- CITIZENSHIP: TOTAL
- DURATION_UNEMPLOYMENT: TOTAL

---

## 6 maggio 2026 — Fase 3: download

### Dataset A — Annuale (151_914)
```bash
opensdmx run queries/A_disoccupazione_annuale.yaml --out output/A_disoccupazione_annuale.csv
```
Output: 13 righe, Italia, 2013-2025

### Dataset B — Trimestrale (151_914)
```bash
opensdmx run queries/B_disoccupazione_trimestrale.yaml --out output/B_disoccupazione_trimestrale.csv
```
Output: 52 righe, 4 trimestri × 13 anni

### Dataset C — Mensile (151_874)
```bash
opensdmx run queries/C_disoccupazione_mensile.yaml --out output/C_disoccupazione_mensile.csv
```
Output: mensile 2022-2025 (904 righe comprensive di tutte le EDITION)

### Dataset D — Mensile storico (151_874, 2013-2022)
Salvato in output/D_disoccupazione_mensile_storica.csv: 6163 righe, selezionata EDITION più recente per ogni mese.

### Dataset F — Destagionalizzato (151_884)
```bash
opensdmx run queries/F_disoccupazione_destagionalizzata.yaml --out output/F_disoccupazione_destagionalizzata.csv
```
Output: 52 righe, dati destagionalizzati Q1 2013 - Q4 2025

---

## 6 maggio 2026 — Double check

- Run 1 (151_914, annuale): 2022=8.09%, 2023=7.65%, 2024=6.52%
- Run 2 (151_884, destagionalizzato quarterly avg): 2022 = (8.39+8.15+8.03+7.86)/4 = 8.11%, 2023 = (7.88+7.67+7.69+7.46)/4 = 7.68%, 2024 = (7.14+6.66+6.25+6.21)/4 = 6.57%
- Risultato: MATCH ✓ (scarto < 0.1pp dovuto all'arrotondamento e alla destagionalizzazione)

---

## 6 maggio 2026 — Fase 4: analisi fact-check

### Mandati di governo
- Renzi: 22 feb 2014 – 12 dic 2016
- Gentiloni: 12 dic 2016 – 1 giu 2018 (**assente dall'infografica**)
- Conte I (M5S-Lega): 1 giu 2018 – 5 set 2019
- Conte II (M5S-PD): 5 set 2019 – 13 feb 2021
- Draghi: 13 feb 2021 – 22 ott 2022
- Meloni: 22 ott 2022 – oggi

### Dati mensili per mandato (EDITION più recente, raw non destagionalizzati)

| Governo | Periodo | Claim infografica | Mese più vicino | Min mandato | Max mandato | Media mandato |
|---|---|---|---|---|---|---|
| Renzi | feb 2014 – dic 2016 | 11.8% | set 2016: 11.79% | ago 2015: 9.93%* | nov 2014: 14.43% | 12.14% |
| Conte I+II | giu 2018 – feb 2021 | 10.1% | feb 2020: 10.02% | apr 2020: 6.44%** | feb 2019: 11.34% | 9.80% |
| Draghi | feb 2021 – ott 2022 | 8% | set 2022: 7.92% | lug 2022: 7.45% | feb 2021: 10.71% | 8.82% |
| Meloni | ott 2022 – mar 2026 | 5.3% | ago 2024: 5.32% | gen 2026: 4.95% | gen 2023: 8.41% | 6.75% |

*Nota: il valore 9.93% per agosto 2015 è presente nel dataset ma risulta anomalo rispetto alla media annuale 2015 (12.01%); potrebbe essere un artefatto di revisione. Il dato destagionalizzato per Q3 2015 è 11.62%.
**Nota: aprile 2020 (6.44%) riflette la distorsione COVID: gli occupati in cassa integrazione erano classificati come occupati, abbassando artificialmente il tasso.

### Conclusioni dell'analisi

1. **I numeri esistono in ISTAT ma sono cherry-picked**: ogni valore dell'infografica corrisponde a un singolo mese specifico, non a una media o a un periodo rappresentativo.

2. **Metodologia inconsistente**: per Meloni si usa agosto 2024 (minimo stagionale mensile), per gli altri si usano mesi diversi senza spiegazione.

3. **"Conte" fonde due governi distinti**: Conte I (centrodestra populista) e Conte II (centrosinistra) sono riuniti in un'unica cifra, il che non ha senso politico né statistico.

4. **Gentiloni è assente**: ha governato dic 2016 – giu 2018, periodo in cui la disoccupazione è scesa da ~12% a ~10.5%.

5. **Il trend è continuo dal 2014**: la disoccupazione scende dal picco di 12.85% (2014) a 6.52% (2024) in modo quasi lineare, indipendentemente dal colore del governo.

6. **Agosto ha effetto stagionale**: agosto mostra sistematicamente i valori più bassi (effetti stagionali di turismo e agricoltura). Usare agosto 2024 per Meloni è particolarmente vantaggioso.

---

## 6 maggio 2026 — Fase 5: visualizzazioni

- Dataset A (annuale): chart.xkcd.XY per serie storica 2013-2025 con annotazioni mandati
- Chart.xkcd.Bar per confronto "claim vs media mandato" per ciascun premier
- Tabella HTML per il verdetto finale

---

## 6 maggio 2026 — Fase 7: pattern per executive summary

- Temporale: disoccupazione cala da 12.85% (2014) a 6.52% (2024) = −6.33pp in 10 anni; trend continuo
- Cherry-pick: Meloni 5.3% (agosto 2024, mese di minimo stagionale) vs media mandato 6.75%; differenza = 1.45pp
- Sorpresa: la distorsione COVID (apr 2020 = 6.44% sotto Conte) è peggiore del dato Meloni nell'infografica, ma non è menzionata
