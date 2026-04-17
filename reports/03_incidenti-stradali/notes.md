# Note — Incidenti Stradali in Europa

## Fase 0 — Domanda di ricerca

### Domanda di ricerca
Quanti incidenti stradali (con vittime) si verificano nei paesi europei? Qual è la distribuzione per paese e come si è evoluta nel tempo? L'obiettivo è identificare i paesi con il maggior/minor numero di vittime per milione di abitanti (se disponibile) o in termini assoluti.

### Proxy statistica
Numero di persone decedute in incidenti stradali (Road accidents - fatalities).

### Scope
I dati coprono gli incidenti avvenuti su strade pubbliche che coinvolgono almeno un veicolo in movimento e causano la morte di almeno una persona. I decessi che avvengono entro 30 giorni dall'incidente sono generalmente inclusi (definizione standard). Sono esclusi i tentati suicidi, gli omicidi e gli incidenti in aree private (es. piste ciclabili chiuse al traffico).

### Provider candidati
- **Eurostat (estat)**: Fonte primaria per i dati armonizzati dell'UE.
- **OECD (oecd)**: Possibile confronto extra-UE o serie storiche lunghe.

---

## Fase 1 — Ricerca dataset con opensdmx

### 1.1 Ricerca
Cercato "road accidents" e "sdg road".
Scelti i dataset:
- `SDG_11_40`: "Road traffic deaths, by type of roads". Contiene sia il numero assoluto che il tasso per 100.000 abitanti.

### 1.2 Dimensioni e valori
Dimensioni per `SDG_11_40`:
- `freq`: A (Annuale)
- `tra_infr`: Infrastruttura (TOTAL, MWAY, RD_URB, RD_RUR)
- `unit`: Unità (NR = Numero, RT = Tasso per 100.000 abitanti)
- `geo`: Geopolitica (Stati membri UE e altri)

### 1.3 Metadati
Scaricati i codici di riferimento in `metadata/` (naming: `nome_query-meta.csv`):
- `A_tasso_mortalita-meta.csv` (unità RT)
- `B_numero_morti-meta.csv` (unità NR)
- `C_tipo_strada-meta.csv` (infrastrutture MWAY, URB, RUR)
- `common-geo-meta.csv` (codici paese)
Comando: `opensdmx -o csv values SDG_11_40 <DIM> --provider eurostat > metadata/<FILE>-meta.csv`

---

## Fase 2 — Download dei dati

### 2.1 Query salvate
- `A_tasso_mortalita.yaml`: Tasso per 100.000 abitanti, totale strade.
- `B_numero_morti.yaml`: Numero assoluto di morti, totale strade.
- `C_tipo_strada.yaml`: Tasso per tipo di strada (Autostrade, Urbane, Rurali).

### 2.2 Esecuzione
Dati scaricati in `output/` con successo.

---

## Fase 4 — Visualizzazioni

### 4.1 Scelta dei grafici
- **Ranking (BarH)**: Usato per confrontare i 27 paesi UE nel 2023. Permette di vedere chiaramente chi è sopra e chi è sotto la media.
- **Trend (XY)**: Serie storica 2010-2023 per Italia e Media UE. Evidenzia il calo decennale e l'anomalia del 2020.
- **Breakdown (Bar)**: Confronto Italia vs UE per tipo di strada (2022) per evidenziare dove l'Italia performa peggio (urbane).

---

## Fase 5 — Costruzione della pagina HTML
Creato `index.html` con i dati inline estratti dai CSV.

### Dati chiave emersi:
- Media UE 2023: **4.5** morti / 100k abitanti.
- Italia 2023: **5.2** morti / 100k abitanti (trend stabile/leggera risalita dopo il 2020).
- Criticità Italia: Strade urbane (**2.3** vs **1.8** UE) e strade rurali (**2.6** vs **2.4** UE).

---

## Fase 6 — Accountability
- Tutte le query sono salvate in `queries/`.
- Tutti i CSV originali sono in `output/`.
- La metodologia è documentata nella pagina HTML.
