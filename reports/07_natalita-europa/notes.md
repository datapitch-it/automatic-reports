# Note — Natalità in Europa: tassi di fecondità e fattori correlati

## 2026-04-24 — Fase 0: domanda di ricerca

## Domanda di ricerca
Come è cambiata la natalità in Europa negli ultimi vent'anni e quale correlazione
esiste tra il tasso di fecondità totale (TFR), l'occupazione femminile, la
disponibilità di asili nido e la spesa pubblica per le politiche familiari?

## Proxy statistica
- Tasso di fecondità totale (TFR) → DEMO_FIND / indic_de=TOTFERRT
- Tasso di occupazione femminile (15-64 anni) → LFSI_EMP_A / sex=F
- Copertura asili nido (bambini < 3 anni in strutture formali) → TPS00185
- Spesa pubblica per la famiglia in % del PIL → SPR_EXP_FFA / unit=PC_GDP

## Scope
Questi dati coprono i 27 paesi UE (EU27). Non includono:
- politiche fiscali (detrazione figli, crediti d'imposta)
- costo della vita e prezzi delle abitazioni (calcolato separatamente)
- immigrazione e suo impatto sul tasso di natalità
- welfare informale (nonni, reti familiari)

## Provider candidati
- Eurostat (estat) — dataset: DEMO_FIND, LFSI_EMP_A, TPS00185, SPR_EXP_FFA

---

## 2026-04-24 — Fase 1: ricerca dataset

- Navigazione top-down: popul → demo → demo_fer (18 df) → DEMO_FIND
- Navigazione top-down: popul → labour → employ → lfsi → LFSI_EMP_A
- Navigazione top-down: popul → livcon → ilc_lv → ilc_ca → TPS00185
- Navigazione top-down: popul → spr → spr_exp → SPR_EXP_FFA

Dataset scelti:
- DEMO_FIND: indicatori di fecondità nazionali, annuale, 1960-2024
- LFSI_EMP_A: occupazione per sesso ed età (LFS), annuale, 2003-2025
- TPS00185: cura formale dei bambini per durata e fascia d'età, annuale, 2014-2025
- SPR_EXP_FFA: spesa per protezione sociale funzione famiglia/bambini, annuale, 1990-2023

---

## 2026-04-24 — Fase 2: esplorazione dimensioni

### DEMO_FIND
- indic_de=TOTFERRT: tasso di fecondità totale
- geo: 60 valori (incl. EU27_2020, paesi singoli, aggregati)
- TIME_PERIOD: 1960–2024, annuale

Scelta: indic_de=TOTFERRT, geo=tutti i paesi EU27, 2000–2024

### LFSI_EMP_A
- indic_em=EMP_LFS: occupazione (LFS)
- sex=F: solo donne
- age=Y15-64: fascia principale
- unit=PC_POP: percentuale della popolazione
- geo: 38 valori, 2003–2025

Scelta: indic_em=EMP_LFS, sex=F, age=Y15-64, unit=PC_POP, 2003–2024

### TPS00185
- unit=PC: percentuale
- indic_il: 6 valori (SC101-SC113, per fascia d'età e ore di cura)
- geo: 41 valori, 2014–2025

Scelta: indic_il=SC102+SC103 (bambini <3 anni con almeno 1 ora di cura formale), 2014–2024

### SPR_EXP_FFA
- spdep=SPR: totale protezione sociale
- spdepm=TOTAL
- unit=PC_GDP: % del PIL
- geo: 46 valori, 1990–2023

Scelta: spdep=SPR, spdepm=TOTAL, unit=PC_GDP, 2003–2022

---

## 2026-04-24 — Fase 3: download

[vedi sezioni successive]
