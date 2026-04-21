# Note — Media e giornalismo in Europa

## 2026-04-21 — Fase 0: domanda di ricerca

### Domanda di ricerca
Come è cambiata l'occupazione nel settore dei media in Europa (editoria, produzione TV/radio, broadcasting)?
Chi legge ancora i giornali di carta? Esiste un profilo demografico del lettore di quotidiani?

### Proxy statistica
- Occupazione nel settore media → migliaia di persone occupate per attività NACE (J58, J59, J60)
- Consumo di stampa → percentuale della popolazione che ha letto almeno un quotidiano negli ultimi 12 mesi

### Scope
I dati SDMX NON coprono:
- Giornalisti freelance non contrattualizzati (non rilevati dall'occupazione NACE)
- Consumo di notizie online (Eurostat non ha un dataset aggiornato sul digital news consumption)
- Qualità dell'informazione, pluralismo, indipendenza editoriale
- Dati dopo il 2024 (occupazione) e dopo il 2011 (lettura quotidiani)
- I dati di lettura dei quotidiani sono fermi al 2011: questa è un'analisi storica sul profilo del lettore tradizionale

### Provider candidati
- Eurostat (principale)

---

## 2026-04-21 — Fase 1: ricerca dataset

Comandi usati:
- `opensdmx search "newspaper"` → 3 risultati (CULT_PCS_NWA, NWS, NWE)
- `opensdmx search "cultural employment"` → 6 risultati (CULT_EMP_*)
- `opensdmx search "broadcasting"` → 2 risultati obsoleti (2003)

Dataset scelti:
- `CULT_EMP_N2` — Occupazione culturale per settore NACE Rev.2 (2008-2026): contiene J58, J59, J60 = cuore del settore media
- `CULT_PCS_NWA` — Lettori di quotidiani per fascia d'età
- `CULT_PCS_NWS` — Lettori di quotidiani per sesso
- `CULT_PCS_NWE` — Lettori di quotidiani per livello di istruzione

Dataset esclusi:
- `CULT_EMP_SEX`, `CULT_EMP_AGE`, `CULT_EMP_EDU` — breakdown demografici dell'occupazione culturale totale, non specifici per media
- `TRNG_INF8/9` — uso dell'educational broadcasting nel 2003, obsoleto

---

## 2026-04-21 — Fase 2: esplorazione dimensioni

CULT_EMP_N2:
- freq: A (annuale)
- nace_r2: TOT, C18, C32, J58, J59, J60, M74, R90, R91, OTH, NRP
- unit: THS_PER (migliaia di persone)
- geo: 36 paesi europei
- TIME_PERIOD: 14 anni (2011-2024)

CULT_PCS_NWA:
- freq: A / frequenc: DAY, GE1W, LT1M (frequenza di lettura)
- age: 8 fasce
- unit: PC (percentuale)
- geo: 25 paesi
- TIME_PERIOD: 2007, 2011 (solo 2 rilevazioni)

---
