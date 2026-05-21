# Notes — Corruzione, percezione e giustizia nell'UE (Report 13)

## Research question
### Original (verbatim)
Analizza i dati disponibili sulla corruzione nell'UE e nei paesi candidati sulla base degli angoli giornalistici della call ISF-2026-TF2-AG-CORRUPT.

### Cleaned
Nell'UE e nei paesi candidati, un CPI più basso corrisponde a un funnel giudiziario più debole (meno condanne per corruttela relative ai sospettati), e a una minore percezione di indipendenza della giustizia?

## Statistical proxy
Cinque dataset Eurostat:
- SDG_16_50: Corruption Perceptions Index (Transparency International via Eurostat) — proxy di percezione della corruzione sistemica
- CRIM_OFF_CAT (ICCS0703/07031/07041/09051): reati di corruzione registrati dalla polizia per 100k abitanti — proxy di capacità di rilevazione
- CRIM_JUST_BRI: persone per stazione giudiziaria (sospettate/processate/condannate) per corruttela, per 100k — proxy di efficacia del sistema giudiziario
- SDG_16_40: % percepisce la giustizia come molto/abbastanza indipendente — proxy di fiducia istituzionale
- GOV_10A_EXP (GF03): spesa pubblica per ordine pubblico e sicurezza (% PIL) — proxy di investimento istituzionale

## 2026-05-21 — Phase 1: Dataset search
- Navigato albero tematico Eurostat: schemi popul, tb_eu, cc
- Trovato ramo crim (Crime and criminal justice) sotto popul
- Trovato sdg_16 (Goal 16: Peace, justice and strong institutions) sotto tb_eu
- Trovato GOV_10A_EXP con COFOG GF03 (ordine pubblico e sicurezza)
- Dataset selezionati: SDG_16_50, CRIM_OFF_CAT, CRIM_JUST_BRI, SDG_16_40, GOV_10A_EXP
- Dataset esclusi: INN_CIS8_PROC/INN_CIS9_PROC (appalti pubblici, dati 2012/2014 troppo datati)
- Gap identificati: Moldova (MD) e Ucraina (UA) assenti da tutte le statistiche penali Eurostat

## 2026-05-21 — Phase 2: Download
- A_cpi.csv: SDG_16_50, freq=A unit=SC, 2012-2025 → 616 righe, 44 paesi
- B_reati_corruzione.csv: CRIM_OFF_CAT, ICCS0703+07031+07041+09051, unit=P_HTHAB, 2013-2024 → 1079 righe, 37 paesi
- C_bribery_pipeline.csv: CRIM_JUST_BRI, leg_stat=PER_SUSP+PER_PRSC+PER_CNV, sex=T, unit=P_HTHAB, 2013-2022 → 480 righe, 37 paesi
- D_indipendenza_giustizia.csv: SDG_16_40, lev_perc=VG_FG+VB_FB, unit=PC, 2015-2024 → 514 righe, 34 paesi
- E_spesa_ordine_pubblico.csv: GOV_10A_EXP, unit=PC_GDP sector=S13 cofog99=GF03+GF0301+GF0303 na_item=TE, 2010-2023 → 1428 righe, 34 paesi

## 2026-05-21 — Phase 3: Inspection and transformations

### Dataset A — SDG_16_50 CPI
- Range EU27: 62-65 (2012-2025). Picco 2015 (65), calo a 62 nel 2024-2025
- Usato: anno più recente per paese (2025 per quasi tutti), valore EU27_2020 per serie storica
- Esclusi aggregati (EA21, EA20) e paesi fuori scope (RU, US, JP, KR, TR, UK, NO, CH, IS)
- Inclusi: EU27 (27) + 6 candidati call (AL, BA, ME, MK, RS, XK) = 33 paesi

### Dataset B — CRIM_OFF_CAT
- Paradosso nordico: paesi con CPI più alto (SE, FI, DK) registrano più reati di corruzione per 100k
  (SE: 222.96, FI: 126.65, DK: 81.17) — riflette MIGLIORE capacità di rilevazione, non più corruzione
- BA (Bosnia) assente dai dati: dato mancante per uno dei principali paesi candidati
- XK (Kosovo): dati solo dal 2016, valore 14.68 (anno più recente disponibile)
- TR (Turchia): dati solo 2016, esclusa dal chart (non nella call)

### Dataset C — CRIM_JUST_BRI
- 23 paesi con pipeline completa (sospettati + processati + condannati)
- Casi anomali: PT (140.7%), FI (195.6%), TR (625.0%) — condannati > sospettati per sfasamento temporale
  dei cicli processuali. Esclusi dal grafico, mantenuti in nota
- DK e LU: sospettati = 0.00 per 100k (effettivo arrotondamento) → tasso = 0.0%, esclusi
- Range significativo: EL (1.0%) → PL (86.3%) — 85 punti percentuali di differenza
- Finding chiave: Grecia 1% di tasso di condanna per corruttela (5.03 sospettati → 0.05 condannati per 100k)

### Dataset D — SDG_16_40
- EU27 media: 52% percepisce la giustizia come molto/abbastanza indipendente
- Solo paesi EU27 + UK, no paesi candidati (gap per tutti i 6 candidati della call)
- Paesi più fiduciosi: DK (83%), FI (83%), AT (82%), SE (78%)
- Paesi meno fiduciosi: HR (23%), BG (24%), PL (28%), SK (33%), IT (36%)

### Dataset E — GOV_10A_EXP
- RO spende 3.1% PIL in ordine pubblico ma ha CPI 45 (paradosso della spesa inefficace)
- DK spende solo 1.0% PIL ma ha CPI 89 (qualità vs. quantità istituzionale)
- Dato usato in nota metodologica, non visualizzato separatamente (troppo distante dai finding principali)

## 2026-05-21 — Phase 7: Patterns for executive summary
- Temporale: EU27 CPI sceso da 65 (2015) a 62 (2025) — deterioramento lento ma costante
- Country: gap 50 punti DK(89) vs BG/HU(40) — divario strutturale nell'EU stessa
- Surprise: i paesi con CPI più alto registrano PIÙ reati di corruzione per 100k (paradosso nordico)
  → SE (222.96/100k, CPI 80) vs SK (0.90/100k, CPI 48): riflette capacità di rilevazione
- Second surprise: Grecia con CPI 50 e 5.03 sospettati/100k per corruttela → solo 0.05 condannati/100k (1%)
  → impunità strutturale nonostante presenza di indagini
