# Note — Stereotipi di genere: dati statistici

## Domanda di ricerca
In che misura i dati statistici europei riflettono e misurano gli stereotipi di genere?
Ci concentriamo su tre proxy misurabili: segregazione occupazionale per settore e sesso,
rappresentanza femminile nell'istruzione STEM, e squilibrio nel lavoro di cura non retribuito.

## Proxy statistica
1. **Occupazione per settore e sesso** — quota di donne nei settori tradizionalmente "maschili"
   (es. ICT, costruzioni, ingegneria) e di uomini nei settori "femminili" (es. istruzione, sanità)
2. **Istruzione STEM** — percentuale di laureate in materie STEM rispetto al totale laureati
3. **Lavoro di cura non retribuito** — ore settimanali dedicate ad attività domestiche e di cura
   per sesso (se disponibile in SDMX)

## Scope — cosa i dati NON coprono
- Atteggiamenti e percezioni soggettive (misurabili solo da survey qualitative, non SDMX)
- Stereotipi nei media, nella pubblicità, nel linguaggio
- Differenze intra-paese (regioni, classi sociali, etnie)
- Causalità: i dati mostrano correlazioni, non dimostrano che gli stereotipi siano la causa

## Provider candidati
- Eurostat (estat) — Labour Force Survey, Education statistics
- OECD — Employment by activity
- ISTAT — per confronto Italia

---

## Log operazioni

### 2026-04-09 — Fase 1: ricerca dataset

**Dataset selezionati**:
- `TPS00217` (Eurostat) — Female tertiary education graduates in STEM, % of all STEM graduates
  - Dimensioni usate: sex=F, isced11=ED5-8, iscedf13=F05_06_07, unit=PC
  - Incluso: proxy per stereotipi nell'istruzione superiore
- `LFSA_EGAN2` (Eurostat) — Employed persons by economic activity (NACE Rev. 2)
  - Dimensioni usate: unit=THS_PER, sex=M+F, age=Y15-74, nace_r2=C+F+J+P+Q, geo=EU27_2020
  - Incluso: misura la segregazione occupazionale orizzontale per settore
  - Codici NACE scelti: C=Manifattura, F=Costruzioni, J=ICT, P=Istruzione, Q=Sanità
- `LFSA_EPPGA` (Eurostat) — Persons in part-time employment by age, % of total employment
  - Dimensioni usate: unit=PC, sex=M+F, age=Y15-74
  - Incluso: il lavoro part-time è fortemente asimmetrico per genere e riflette stereotipi di cura

**Dataset esclusi**:
- `TUS_00AGE` — Time use by sex: disponibile solo per 2000 e 2010, troppo datato per analisi trend
- `CENS_91AENACE` — Censimento 1991, troppo datato
- `LFSA_EPGAIS` — Part-time per occupazione: non include la disaggregazione per sesso necessaria

---

### 2026-04-09 — Fase 2: download dati

- `output/A_stem_laureate_femmine.csv`: 333 righe, 39 paesi, anni 2015-2023
- `output/B_occupazione_settore_sesso.csv`: 140 righe, EU27 aggregato, 5 settori NACE × 2 sessi × 14 anni
- `output/C_part_time_sesso.csv`: 1026 righe, 38 entità geografiche, anni 1983-2023 (usato 2010-2023)

---

### 2026-04-09 — Fase 3: ispezione e trasformazioni

#### Trasformazioni Dataset A (STEM laureate)
- Dati grezzi: 333 righe, 39 paesi/territori, anni 2015-2023
- Filtrato: mantenuti solo i 27 paesi EU + CH, NO, IS, TR e candidati (RS, ME, BA, MK, AL)
- Selezionato l'ultimo anno disponibile per paese (2023 per quasi tutti)
- Dati finali per grafico ranking: 36 osservazioni
- Range: 26.3% (CH) – 51.9% (MK); escl. LI (70%, outlier con campione piccolo)

#### Trasformazioni Dataset B (segregazione settoriale EU27)
- Dati grezzi: 140 righe, EU27 aggregato, 5 settori × 2 sessi × 14 anni
- Calcolata quota femminile per settore: F/(F+M)×100
- Quote 2023: Sanità 78.1%, Istruzione 72.7%, Manifattura 30.5%, ICT 30.2%, Costruzioni 10.5%
- Nota: costruzioni ha 10.5% donne = settore più "mascolinizzato"; sanità = più "femminilizzato"
- La quota donne in ICT è in lieve calo dal 2010 (32.4%) al 2023 (30.2%) — trend preoccupante

#### Trasformazioni Dataset C (part-time per sesso)
- Dati grezzi: 1026 righe, 38 entità, anni 1983-2023
- Filtrato: utilizzato periodo 2010-2023 per serie temporale EU27
- EU27 2023: donne 29.1%, uomini 9.4% — gap di ~20 punti percentuali
- Gap maggiore: NL (38.8pp), AT (37.3pp), DE (35.4pp)
- Gap minore: RO (-0.7pp, uomini lavorano più part-time), BG (0.3pp)
- Nota: la Romania e la Bulgaria hanno gap quasi nullo — contesto economico diverso
- Dati finali per grafico ranking EU27: 27 osservazioni

