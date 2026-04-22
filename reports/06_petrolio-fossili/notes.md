# Note — Petrolio e combustibili fossili: produzione, importazioni, usi, riserve

## 2026-04-22 — Fase 0: domanda di ricerca

## Domanda di ricerca
Da dove arriva il greggio importato in Europa, a quale prezzo, da quali giacimenti specifici,
come viene usato (usi energetici vs non energetici / materia prima industriale),
e quanti giorni di autonomia hanno i paesi UE con le riserve strategiche?

## Proxy statistica
- Prezzi internazionali: IMF PCPS — Brent, WTI, OPEC Basket, gas naturale EU, carbone
- Importazioni per paese fornitore: Eurostat NRG_TI_OIL — volume in migliaia di tonnellate per partner
- Importazioni per giacimento: Eurostat NRG_TI_COIFPM — volume in migliaia di barili per campo petrolifero
- Produzione interna vs importazioni: Eurostat NRG_CB_COSM
- Usi non energetici: Eurostat NRG_CB_OIL — codici nrg_bal FC_NE, FC_IND_CPC_NE, NE_PI
- Riserve strategiche: Eurostat NRG_STK_OEM — giorni equivalenti di scorta di emergenza

## Scope
Questi dati coprono il lato dell'offerta (importazioni, produzione) e dei prezzi di mercato.
NON coprono: emissioni di CO2 associate, prezzi al consumo finale (benzina/gasolio alla pompa),
contratti a lungo termine, accordi bilaterali non pubblici.

## Provider candidati
- Eurostat (principale)
- IMF (prezzi commodity)

## Lingua
Italiano

## Focus geografico
Italia + confronto EU27

---

## 2026-04-22 — Fase 1: ricerca dataset

### Dataset trovati e inclusi

| ID | Provider | Descrizione | Motivo inclusione |
|---|---|---|---|
| IMF.RES,PCPS | IMF | Primary Commodity Price System | Prezzi Brent/WTI/OPEC/gas/carbone, mensili dal 1990 |
| NRG_TI_OIL | Eurostat | Importazioni olio e prodotti per paese partner | Annuale 1990-2023, 167 partner, 38 prodotti |
| NRG_TI_COIFPM | Eurostat | Importazioni greggio per giacimento di produzione | 819 giacimenti, mensile 2005-oggi, 6 indicatori |
| NRG_CB_COSM | Eurostat | Offerta greggio (produzione + import) mensile | PRD vs IMP, prezzi e volumi |
| NRG_CB_OIL | Eurostat | Bilancio olio e prodotti petroliferi | Contiene codici _NE per usi non energetici |
| NRG_STK_OEM | Eurostat | Scorte petrolifere di emergenza in giorni | Mensile 2013-oggi, 36 paesi, obbligo 90gg UE |

### Dataset trovati ma esclusi (con motivo)
- NRG_BAL_C: troppo ampio (tutti i vettori energetici); NRG_CB_OIL è più specifico per il petrolio
- NRG_BAL_S: versione semplificata, meno granulare
- NRG_TI_OILM: mensile di NRG_TI_OIL — preferita versione annuale per chiarezza narrativa
- ENV_AC_PEFASU: settori NACE — rimandato a sezione opzionale futura
- NRG_STK_OOM, NRG_STK_OAM: scorte cross-border — incluso solo OEM per semplicità
- OECD FFS: sussidi ai fossili — fuori scope per questa release

---

## 2026-04-22 — Fase 2: esplorazione dimensioni

### IMF.RES,PCPS
- Dimensioni: COUNTRY (G001 = globale), INDICATOR, DATA_TRANSFORMATION, FREQUENCY
- Indicatori scelti: POILBRE, POILWTI, POPEC, PNGASEU, PCOAL
- Trasformazione: P (prezzi, non indici)
- Frequenza: M (mensile)

### NRG_TI_OIL
- Dimensioni: freq, siec, partner, unit, geo
- siec scelto: O4100_TOT (greggio) + O4000 (totale petrolio e derivati)
- partner: tutti (wildcard)
- unit: THS_T (migliaia di tonnellate) — unico valore disponibile
- geo: EU27_2020

### NRG_TI_COIFPM
- Dimensioni: freq, crudeoil, indic_nrg, geo
- indic_nrg scelto: VOL_THS_BBL (volume in migliaia di barili)
- geo: IT (Italia)
- crudeoil: tutti (wildcard) — poi filtrato top 20 in post-processing

### NRG_CB_COSM
- Dimensioni: freq, nrg_bal, indic_nrg, geo
- nrg_bal: PRD (produzione indigena) + IMP (importazioni)
- indic_nrg: VOL_THS_BBL
- geo: IT+DE+FR+ES+PL+NL

### NRG_CB_OIL (usi non energetici)
- Dimensioni: freq, nrg_bal, siec, unit, geo
- nrg_bal: FC_NE (consumo finale non energetico)
- siec: O4640 (nafta) + O4300 (feedstock raffineria) + O4000 (totale)
- unit: THS_T
- geo: EU27_2020 + IT

### NRG_STK_OEM
- Dimensioni: freq, stk_flow, unit, geo
- unit: NR (giorni — non THS_T)
- geo: tutti
