# JournAI — Metodologia per analisi dati SDMX con AI

## Scopo

Questo documento descrive il metodo di lavoro per produrre analisi di dati statistici
istituzionali (formato SDMX) partendo da una domanda di ricerca e arrivando a una pagina
HTML autosufficiente, leggibile da chiunque, con tutti i passaggi documentati e replicabili.

**Stack**: opensdmx CLI · Bootstrap 5 · roughViz 1.0.6 · chart.xkcd 1.1

---

## Struttura cartelle

Ogni analisi vive in una propria cartella dentro `reports/`.
Il nome della cartella è un numero progressivo a due cifre + slug descrittivo.

```
/
├── assets/
│   ├── style.css           ← CSS condiviso da tutti i report
│   └── shell.js            ← funzione initShell()
├── index.html              ← catalogo (legge reports.json via fetch)
├── reports.json            ← manifest dei report
└── reports/
    └── 01_slug-del-tema/
        ├── index.html      ← pagina analitica (~360 righe: sezioni dataset + config initShell)
        ├── output/         ← CSV scaricati dall'API, mai modificati a mano
        │   ├── A_nome.csv
        │   ├── B_nome.csv
        │   └── ...
        ├── metadata/       ← codelist e metadati scaricati con opensdmx
        ├── queries/        ← file YAML con le query riproducibili
        │   ├── A_nome.yaml
        │   └── ...
        └── notes.md        ← log cronologico delle operazioni (vedi sezione Accountability)
    └── 02_slug-del-tema/
        ...
```

**Regola**: tutto quello che serve per riprodurre l'analisi deve stare nel repository.
`index.html` dipende da `../../assets/` (CSS e JS condivisi, nel repo) e dai CDN per
Bootstrap, roughViz e chart.xkcd. Non dipendere da file fuori repository.

---

## Fase 0 — Lingua del report

**Prima di qualsiasi altra operazione**, chiedere all'utente:

> In che lingua devo generare il report?

Attendere la risposta. La lingua scelta si applica a:
- tutti i testi della pagina `index.html` (titoli, descrizioni, callout, note, label dei grafici)
- il contenuto di `notes.md`
- i nomi dei file non sono interessati (restano in inglese/slug)

I codici SDMX, i nomi delle variabili, i comandi CLI e gli URL API rimangono
sempre in inglese indipendentemente dalla lingua scelta.

---

## Fase 0 — Definizione della domanda

Prima di fissare la domanda, **proporre all'utente una lista numerata di possibili domande di ricerca** derivate dal tema indicato. Esempio:

> Ecco alcune domande di ricerca possibili per questo tema:
>
> 1. Come è cambiato il tasso di occupazione femminile in Europa negli ultimi 10 anni?
> 2. Quali paesi UE hanno ridotto maggiormente il gender pay gap dal 2010?
> 3. Esiste una correlazione tra spesa pubblica per l'infanzia e tasso di occupazione femminile?
>
> Quale ti interessa, o vuoi partire da una domanda diversa?

Attendere la scelta dell'utente. Solo dopo, fissare per iscritto in `notes.md`:

```markdown
## Domanda di ricerca
[Cosa si vuole misurare e perché]

## Proxy statistica
[Quale grandezza misurabile in SDMX approssima il fenomeno di interesse]

## Scope
[Cosa i dati SDMX NON coprono — da dichiarare esplicitamente nella pagina]

## Provider candidati
[Da compilare dopo aver eseguito `opensdmx providers` — vedi Fase 1.1]
```

---

## Fase 1 — Ricerca dataset con opensdmx

### 1.1 Listare i provider disponibili

> **Questo è il primo comando obbligatorio di ogni analisi.** La lista dei provider
> cambia con gli aggiornamenti di opensdmx: eseguire sempre il check per avere la
> versione corrente, non fidarsi di liste statiche.

```bash
opensdmx --output json providers
```

Output: array JSON con `alias`, `name`, `agency_id`, `constraints_supported`, `last_n_supported`, `categories_supported`.

Annotare in `notes.md` i provider candidati con le loro capacità, poi compilare la sezione
**Provider candidati** nella Fase 0 con l'output reale.

Colonne chiave e cosa implicano:
- **`constraints_supported`**: se `false`, usare `opensdmx values` invece di `opensdmx constraints` per esplorare i codici validi.
- **`last_n_supported`**: se `false`, non usare `--last-n` nelle query (es. World Bank).
- **`categories_supported`**: se `false`, saltare `opensdmx tree` e usare direttamente `opensdmx search`.

### 1.2 Cercare dataset per parola chiave

```bash
opensdmx search "<parola chiave>" --provider <provider_id>
# esempio:
opensdmx search "government expenditure" --provider estat
opensdmx search "defence" --provider oecd
```

Output: elenco di dataset con ID e descrizione.
Cercare più varianti della parola chiave. Annotare in `notes.md` tutti i dataset trovati
e il motivo per cui ciascuno viene incluso o escluso.

### 1.3 Ottenere informazioni su un dataset

```bash
opensdmx info <DATASET_ID> --provider <provider_id>
# esempio:
opensdmx info GOV_10A_EXP --provider estat
```

Output: descrizione, dimensioni disponibili, periodicità, copertura geografica.

### 1.4 Esplorare le dimensioni e i codici validi

```bash
opensdmx info <DATASET_ID> --provider <provider_id>
```

Per ogni dimensione rilevante (quella su cui si applica un filtro o che viene usata come asse/serie nel grafico), **è obbligatorio** scaricare la tabella dei codici (codelist) in `metadata/`. Questo garantisce che il report sia consultabile offline.

**Comando per scaricare i metadati**:
Usare l'opzione globale `-o csv` e la redirezione shell. I file devono seguire lo stesso schema di naming dei file in `output/` aggiungendo il suffisso `-meta`.

```bash
opensdmx -o csv values <DATASET_ID> <DIMENSION_NAME> --provider <provider_id> > metadata/<QUERY_NAME>-meta.csv
# esempio:
# se il dato è output/A_spesa_militare.csv
opensdmx -o csv values GOV_10A_EXP cofog99 --provider eurostat > metadata/A_spesa_militare-meta.csv
```

**Annotare in `notes.md`**: per ogni dimensione usata, il codice scelto e il motivo. Se una query coinvolge più dimensioni critiche, scaricare più file meta seguendo lo schema `[NOME_QUERY]-meta-[DIMENSIONE].csv`.

---

## Fase 2 — Download dei dati

### 2.1 Query con filtri espliciti

```bash
opensdmx get "<DATASET_ID>" \
  --provider <provider_id> \
  --<DIMENSION_1> <valore> \
  --<DIMENSION_2> <val1>+<val2>+<val3> \
  --start-period <YYYY> \
  --end-period <YYYY> \
  --out output/A_nome.csv
```

**Regole**:
- Valori multipli per una dimensione si separano con `+`
- Omettere una dimensione = tutti i valori disponibili
- Usare sempre `--out` per salvare in `output/`
- Il file CSV non va mai modificato a mano

Esempio reale (Eurostat):

```bash
opensdmx get "GOV_10A_EXP" \
  --provider estat \
  --FREQ A \
  --unit PC_GDP \
  --sector S13 \
  --cofog99 GF0201 \
  --na_item TE \
  --start-period 2000 \
  --end-period 2024 \
  --out output/A_nome.csv
```

### 2.2 URL API diretto (Eurostat)

Per Eurostat, ogni query corrisponde a un URL pubblico cliccabile:

```
https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/<DATASET_ID>/<FREQ>.<DIM2>.<DIM3>.<DIM4>.<DIM5>./<GEO>/?startPeriod=<YYYY>&endPeriod=<YYYY>&format=SDMX-CSV
```

L'ordine delle dimensioni nel path segue quello restituito da `opensdmx dimensions`.
**Questo URL va sempre incluso nella pagina HTML nella sezione Metodologia.**

Per OECD il provider non espone un URL pubblico diretto: documentare il comando CLI.

### 2.3 Double check — ripetere ogni estrazione due volte

**Regola obbligatoria**: ogni query `opensdmx get` va eseguita **due volte in modo indipendente** prima di usare i dati.

La seconda esecuzione deve usare un approccio alternativo per costruire la stessa query:
- prima volta: filtri espliciti via flag (`--geo NL --unit PC_GDP ...`)
- seconda volta: URL API Eurostat diretto (Fase 2.2) via `curl` o browser

I risultati sono considerati **validati** solo se il numero di righe, i valori e le dimensioni coincidono. Se divergono, investigare prima di proseguire (cache corrotta, codice ambiguo, aggregato vs individuale).

Annotare in `notes.md`:

```markdown
## Double check — [DATASET_ID]
- Run 1 (opensdmx get): [N righe], [checksum o valore campione]
- Run 2 (URL diretto):  [N righe], [checksum o valore campione]
- Risultato: MATCH ✓ / DIVERGENZA ✗ — [spiegazione se divergenza]
```

Nella pagina HTML, nella sezione **Metodologia**, aggiungere per ogni dataset validato:

```html
<p class="note pt-2 mb-2">
  <strong>Double check passed</strong> — I dati di <code>[DATASET_ID]</code> sono stati
  estratti due volte in modo indipendente (opensdmx CLI + URL API diretto) e i risultati
  coincidono: [N righe], periodo [YYYY–YYYY], [N entità].
</p>
```

### 2.4 Salvare la query come YAML riproducibile

```bash
opensdmx run <query_file.yaml> --out output/A_nome.csv
```

Formato del file YAML:

```yaml
# queries/A_nome.yaml
provider: estat
dataset: GOV_10A_EXP
filters:
  FREQ: A
  unit: PC_GDP
  sector: S13
  cofog99: GF0201
  na_item: TE
  geo: ALL
start_period: "2000"
end_period: "2024"
format: SDMX-CSV
```

Salvare sempre il YAML in `queries/`. Serve per rigenerare i dati in futuro.

---

## Fase 3 — Ispezione e trasformazioni

### 3.1 Ispezionare il CSV scaricato

```bash
head -5 output/A_nome.csv
wc -l output/A_nome.csv
```

Annotare in `notes.md`:
- Numero di righe
- Colonne presenti e loro significato
- Valori unici per le dimensioni chiave (paesi, anni, unità)
- Presenza di flag (`OBS_FLAG`): `p` = provvisorio, `d` = definizione diversa, `b` = rottura di serie
- Dati mancanti: paesi o anni assenti

### 3.2 Documentare ogni trasformazione

Per ogni trasformazione applicata, annotare in `notes.md` (e poi riportare nella pagina HTML):

```markdown
### Trasformazioni Dataset A
- Dati grezzi: X righe, Y paesi, anni XXXX–XXXX
- [descrizione operazione 1]: es. "selezionato l'ultimo anno disponibile per paese"
- [descrizione operazione 2]: es. "escluso il paese X perché valore anomalo (rettifica contabile)"
- [descrizione operazione 3]: es. "calcolato indice base=100 come (valore_anno/valore_base)×100"
- Dati finali usati nel grafico: Z osservazioni
```

**Le trasformazioni vengono incorporate nei dati inline dell'HTML** (array JS) —
non in file CSV separati. Questo garantisce che la pagina sia autosufficiente.

---

## Fase 4 — Visualizzazioni

### Librerie disponibili

| Libreria | Grafici supportati | Contenitore richiesto | Quando usarla |
|----------|--------------------|-----------------------|---------------|
| roughViz 1.0.6 | BarH, Bar, Line, Scatter, Pie | `<div>` | Ranking, confronti puntuali |
| chart.xkcd 1.1 | XY, Bar, StackedBar, Pie, Radar | `<svg>` | Serie temporali, multi-serie |
| matplotlib (xkcd mode) | qualsiasi tipo | `<img src="...">` | Grafici Python generati offline o in notebook, esportati come PNG/SVG |

**Note tecniche fondamentali**:
- **roughViz 1.0.6**: Deve puntare a un contenitore **`<div>`**. La libreria crea l'elemento `<svg>` al suo interno. Se puntata a un `<svg>`, il rendering fallisce o produce sovrapposizioni.
- **chart.xkcd 1.1**: Deve puntare a un elemento **`<svg>`**. Se puntata a un `<div>`, restituisce l'errore `Uncaught TypeError: e.node(...).getComputedTextLength is not a function`.
- `roughViz.Line` ha un bug nel callback `d3.csv` (perde `this`): per serie temporali usare `chart.xkcd.XY` con dati inline.
- `roughViz.BarH` e `roughViz.Bar` **non supportano valori negativi**: la scala x parte da 0 e un valore negativo produce `rect width < 0` con errore console. Se i dati contengono valori negativi, escludere quelle osservazioni dal grafico e documentarle nel blocco `.note` e nel blocco `.transform`.

### Regole per i grafici

- **Baseline a zero — OBBLIGATORIO**: l'asse Y deve sempre partire da zero. Non usare scale troncate che amplificano visivamente variazioni che sarebbero marginali su scala assoluta. Se il range naturale dei dati non include lo zero, l'asse va comunque esteso fino a zero. Per chart.xkcd XY: aggiungere un punto sintetico `{x: primoAnno, y: 0}` alla fine dell'array dati (verrà ignorato visivamente se lontano dal range, ma forza la scala); in alternativa, anteporre all'array dati un punto `{x: annoMinimo - 1, y: 0}` con `showLine: false` sul primo segmento — oppure scegliere una libreria che supporti `yMin: 0` esplicitamente. Questa regola si applica a tutti i tipi di grafico (XY, Bar, BarH). Non ci sono eccezioni: se la scala troncata è l'unico modo di leggere il grafico, il problema è nella scelta del tipo di grafico, non nella baseline.

- **Font minimo 1rem**: impostare sempre `axisFontSize: '1rem'` e `titleFontSize: '1rem'` in ogni
  chiamata roughViz. Il CSS non può garantire questo limite perché roughViz scrive il font-size
  come inline style (`style="font-size: …"`) che ha precedenza su qualsiasi regola CSS senza `!important`.
  L'unico punto di controllo è il parametro JS.
- **UPPERCASE obbligatorio**: tutte le label di asse (nomi paesi, categorie, serie) vanno in maiuscolo.
  In JavaScript: passare le stringhe già in uppercase (`'ITALIA'`, `'25–34 ANNI'`, ecc.)
  oppure usare `.map(s => s.toUpperCase())` sull'array.
- **Label degli assi**: non omettere mai le etichette degli assi (`xLabel`, `yLabel`). Specificare sempre l'unità di misura (es. `"EURO"`, `"PERSONE"`, `"TASSO PER 100K"`).
- **Margine label**: roughViz applica un offset interno fisso di ~10px tra il testo della label
  e l'asse (non modificabile via CSS — SVG text non supporta `padding`). Per compensarlo e dare
  respiro visivo, aggiungere sempre **+10px** al `margin.left` (BarH) o `margin.bottom` (Bar)
  rispetto al valore minimo necessario per contenere il testo.
  Regola pratica: `left = lunghezza_label_più_lunga_in_px + 10`.
  Per BarH con label ~10 caratteri: `left: 160`; con label ~15 caratteri: `left: 190`.

- **Larghezza dal contenitore proprio — OBBLIGATORIO**: ogni libreria che riceve una larghezza in
  pixel (roughViz, D3, Vega-Lite, ecc.) deve misurarla dal contenitore diretto del grafico al
  momento dell'istanziazione — mai da un valore condiviso catturato in anticipo o riusato tra
  grafici diversi. Usare `getComputedStyle` per sottrarre i padding effettivi:
  ```javascript
  const wrap = document.querySelector('#chart-X').closest('.chart-wrap');
  const s    = window.getComputedStyle(wrap);
  const w    = Math.floor(wrap.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight));
  ```
  Inoltre, il wrapper del grafico non deve avere `overflow-y: auto` o `overflow: auto`: path SVG
  che sconfinano verticalmente oltre i bounds dell'SVG (es. barre con valori estremi, rough-fill
  paths) genererebbero una scrollbar che riduce la larghezza disponibile *dopo* che la larghezza
  è già stata misurata, causando clipping sul lato destro dell'SVG. Impostare esplicitamente
  `overflow-y: hidden` sul wrapper.

### Template roughViz.BarH (ranking orizzontale)

```javascript
new roughViz.BarH({
  element: '#chart-[ID]',
  data: {
    labels: [/* array stringhe UPPERCASE, ordine crescente o decrescente */],
    values: [/* array numeri */]
  },
  title: '[Titolo del grafico]',
  titleFontSize: '1rem',
  axisFontSize: '1rem',
  roughness: 1.5,
  stroke: '#333',
  strokeWidth: 1,
  fillStyle: 'hachure',
  fillWeight: 0.7,
  color: '#c0392b',       /* rosso per serie principale */
  highlight: '#e74c3c',
  tooltipStyles: 'background:#fff;border:1px solid #ccc;padding:4px 8px;font-size:1rem;',
  width: 900,
  height: /* proporzionale al numero di barre: ~20px per barra + margini */,
  margin: { top: 40, right: 100, bottom: 30, left: 140 },
  xLabel: '[unità di misura]',
});
```

### Template chart.xkcd.XY (serie temporale)

```javascript
// Dati: array di punti {x: anno, y: valore} — null values esclusi
const anni = [2000, 2001, /* ... */];
const valori = [1.1, 1.2, /* null per anni mancanti */];

const points = [];
anni.forEach((a, i) => {
  if (valori[i] !== null) points.push({ x: a, y: valori[i] });
});

new chartXkcd.XY(document.getElementById('chart-[ID]'), {
  xLabel: '',
  yLabel: '[unità]',
  data: {
    datasets: [{ label: '[nome serie]', data: points }]
  },
  options: {
    showLine: true,
    dotSize: 0.4,
    xTickCount: 4,
    yTickCount: 3,
    dataColors: ['#c0392b'],
  }
});
```

Per small multiples (un grafico per entità), usare un `<svg id="chart-[CODICE]">` per ciascuna
e iterare con `Object.entries(seriesData).forEach(...)`.

### Template matplotlib (xkcd mode)

Usare quando il grafico è generato in Python (notebook o script offline) ed esportato come immagine
statica. Il file va in `output/` e referenziato via `<img src="output/nome-grafico.png">`.

**Regola UPPERCASE**: tutte le label (asse X, asse Y, titolo, tick labels) devono essere uppercase.

```python
import matplotlib
matplotlib.use('Agg')          # backend non-interattivo per export
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

with plt.xkcd():
    fig, ax = plt.subplots(figsize=(9, 4))

    # --- dati ---
    anni  = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
    valori = [23.1, 24.0, 25.3, 26.1, 27.4, 25.0, 26.8, 28.2]

    ax.plot(anni, valori, color='#b02020', linewidth=2, marker='o', markersize=5)

    # --- UPPERCASE obbligatorio per tutte le label ---
    ax.set_xlabel('ANNO', fontsize=12)
    ax.set_ylabel('VALORE (%)', fontsize=12)
    ax.set_title('TITOLO DEL GRAFICO', fontsize=14)

    # tick labels uppercase (se le label sono stringhe)
    ax.set_xticks(anni)
    ax.set_xticklabels([str(a).upper() for a in anni], fontsize=10)

    # baseline a zero — obbligatorio
    ax.set_ylim(bottom=0)

    # griglia leggera
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter('%.1f'))
    ax.grid(axis='y', linestyle='--', alpha=0.4)

    plt.tight_layout()
    plt.savefig('output/nome-grafico.png', dpi=150, bbox_inches='tight')
    plt.close()
```

**Embedding nell'HTML**:

```html
<div class="chart-wrap mb-4">
  <p class="chart-title-label">TITOLO DEL GRAFICO</p>
  <img src="output/nome-grafico.png" alt="TITOLO DEL GRAFICO"
       style="width:100%; max-width:720px; display:block;">
</div>
```

**Quando usarlo vs roughViz / chart.xkcd**:

| Situazione | Libreria consigliata |
|---|---|
| Dati inline nel browser, interattività base | roughViz o chart.xkcd |
| Script Python già esistente, dati in CSV/DataFrame | **matplotlib xkcd** |
| Grafico con layout complesso (subplots, annotazioni) | **matplotlib xkcd** |
| Small multiples con molte serie | **matplotlib xkcd** |
| Report interamente nel browser, zero Python | roughViz / chart.xkcd |

### Palette colori

```
Rosso (serie primaria):   #b02020  highlight: #c0392b
Blu (serie secondaria):   #1a6fa8  highlight: #2980b9
Verde:   #27ae60
Arancio: #e67e22
Viola:   #8e44ad
Teal:    #16a085
```

---

## Fase 5 — Costruzione della pagina HTML

### 5.1 Struttura obbligatoria della pagina

La pagina `index.html` deve contenere nell'ordine:

1. **Header** — titolo, descrizione, badge con provider/periodo/paesi
2. **Nav sticky** — link a tutte le sezioni
3. **Sezione Intro** — cosa si misura, perché, limiti di scope, finding cards (4 numeri chiave)
4. **Sezione per ogni dataset** — **Regola di granularità**: ogni file `output/*.csv` scaricato deve corrispondere esattamente a una sezione `<section>` dedicata. Questo garantisce che ogni query prodotta sia effettivamente analizzata e visualizzata.
5. **Sezione Dati grezzi** — callout licenze + card di download per ogni CSV
6. **Sezione Metodologia** — classificazioni, URL API, comandi CLI, file disponibili
7. **Footer** — fonti, strumenti, **data di generazione**

**Regola data di generazione**: la data deve comparire in **tre punti** della pagina, sempre nel formato `GG mese AAAA` in italiano (es. `24 aprile 2026`):
- nell'eyebrow dell'header: `Ricerca SDMX · [GG mese AAAA] · opensdmx CLI`
- nel callout della sezione Dati grezzi: `Data di estrazione: <strong>[GG mese AAAA]</strong>`
- nell'ultimo `<span>` del footer

La data corrisponde al giorno in cui i dati sono stati scaricati dall'API. Non usare formati ISO (`2026-04-08`) né mesi senza giorno (`Aprile 2026`).

### 5.2 Template `index.html` — struttura con `initShell()`

Non scrivere CSS, nav, header, footer, sezione intro, dati grezzi o metodologia: queste parti
sono generate da `initShell()`. Scrivere solo le sezioni dataset e il config JS.

Dopo ogni nuovo report, aggiornare `reports.json` nella root del repository con una nuova entry
(order, path, date, title, desc, badges). Il catalogo `index.html` legge questo file via
`fetch()` — nessuna modifica all'HTML del catalogo è necessaria.

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITOLO] — Ricerca SDMX</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="../../assets/style.css">
  <script src="https://unpkg.com/rough-viz@1.0.6"></script>
  <script src="https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13/runtime.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.xkcd@1.1/dist/chart.xkcd.min.js"></script>
</head>
<body>

<!-- nav + header generati da initShell() -->
<div id="shell-top"></div>

<!-- intro (finding cards + scope) generata da initShell() -->
<div class="container">
<div id="shell-intro"></div>
</div>

<main class="container py-2">

  <!-- ═══ SEZIONI DATASET — scritte dall'AI ═══ -->

  <section class="section py-5" id="[id]">
    <p class="section-label mb-1">[Fase X] · [Provider] [Dataset ID] · [dimensione chiave]</p>
    <h2 class="mb-2">[Titolo descrittivo del grafico]</h2>
    <p class="subtitle mb-4">[Unità] · [filtri] · [N entità]</p>
    <!-- callout opzionale, note "come leggere", chart-wrap, transform: scritti dall'AI -->
    <div class="chart-wrap mb-4">
      <div id="chart-[id]"></div>   <!-- oppure <svg> per chart.xkcd -->
    </div>
    <div class="transform p-3 mb-4">...</div>
  </section>

  <!-- ═══ FINE SEZIONI DATASET ═══ -->

</main>

<!-- dati grezzi + metodologia generati da initShell() -->
<div id="shell-bottom"></div>

<!-- footer generato da initShell() -->
<div class="container">
<div id="shell-footer"></div>
</div>

<script src="../../assets/shell.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
// ── CONFIG SHELL ─────────────────────────────────────────────────────────────
initShell({ /* oggetto config — vedi schema 5.3 */ });

// ── CHART INIT ───────────────────────────────────────────────────────────────
// I container esistono nel DOM (sezioni sopra). roughViz usa <div>, chart.xkcd usa <svg>.
new roughViz.BarH({ element: '#chart-[id]', data: { labels: [...], values: [...] }, ... });
new chartXkcd.XY(document.getElementById('chart-[id2]'), { ... });
</script>
</body>
</html>
```

### 5.3 Schema `initShell(config)`

```js
initShell({
  // ── HEADER ──────────────────────────────────────────────────────────────
  title:   "Titolo del report",
  date:    "29 aprile 2026",
  intro:   "Descrizione in 2-3 frasi: cosa si analizza, perché è rilevante.",
  badges: [
    { label: "Eurostat",    value: "DATASET_ID" },
    { label: "Periodo",     value: "2000–2024"  },
    { label: "Paesi",       value: "27"         }
  ],

  // ── NAV ─────────────────────────────────────────────────────────────────
  // "← Home", "↓ Intro", "Dati grezzi" e "Metodologia" aggiunti automaticamente.
  nav: [
    { id: "economia",   label: "Economia"   },
    { id: "lavoro",     label: "Lavoro"     }
  ],

  // ── INTRO ────────────────────────────────────────────────────────────────
  introTitle:    "Contesto e risultati",           // opzionale, default se omesso
  introSubtitle: "Una frase di contesto",          // opzionale
  introExtra:    `<h3>...</h3><table>...</table>`, // HTML aggiuntivo prima delle finding cards
  scopeLimit:    "Cosa questi dati NON coprono.",  // testo del callout scope
  findingCards: [
    { value: "14",   label: "indicatori analizzati",  color: "default" },
    { value: "−8pp", label: "calo occupazione 2008",  color: "accent"  },
    { value: "1,18", label: "TFR Sicilia 2022",        color: "blue"    },
    { value: "35%",  label: "NEET under 30",           color: "green"   }
  ],
  // color: omesso o "default" → rosso accent; "blue" → accent2; "green" → verde

  // ── DATI GREZZI ──────────────────────────────────────────────────────────
  rawData: {
    license:        "Eurostat CC BY 4.0",
    extractionDate: "29 aprile 2026",  // default: cfg.date se omesso
    files: [
      {
        provider:  "Eurostat",
        datasetId: "LFST_R_LFE2EMPRT",
        desc:      "Tasso di occupazione NUTS2",
        rows:      312,
        period:    "2000–2023",
        file:      "output/A_occupazione.csv"
      }
    ]
  },

  // ── METODOLOGIA ──────────────────────────────────────────────────────────
  methodology: {
    githubUrl: "https://github.com/datapitch-it/automatic-reports/reports/09_sicilia-indicatori",
    classifications: [                  // opzionale
      { code: "ITG1",  system: "NUTS2",  meaning: "Sicilia"      },
      { code: "TOTAL", system: "age",    meaning: "Tutte le età" }
    ],
    extra: `<p class="note pt-2 mb-4">...</p>`,  // HTML aggiuntivo (double-check, tabelle) — opzionale
    apiUrls: [                          // omettere per OECD/ISTAT (non espongono URL pubblici)
      {
        datasetId: "LFST_R_LFE2EMPRT",
        provider:  "Eurostat",
        desc:      "Tasso di occupazione NUTS2",
        url:       "https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/..."
      }
    ],
    cliHdr:      "Dataset",   // intestazione colonna 1 nella tabella CLI (default "Dataset")
    cliCommands: [
      {
        dataset: "LFST_R_LFE2EMPRT",
        command: "opensdmx run queries/A_occupazione.yaml --out output/A_occupazione.csv"
      }
    ],
    files: [
      { file: "output/A_occupazione.csv",   desc: "312 righe · NUTS2 · 2000–2023"  },
      { file: "queries/A_occupazione.yaml", desc: "Query riproducibile"             },
      { file: "notes.md",                   desc: "Log cronologico delle operazioni" }
    ]
  },

  // ── FOOTER ───────────────────────────────────────────────────────────────
  providers: "Eurostat · ISTAT",
  github:    "https://github.com/datapitch-it/automatic-reports"
});
```

---

## Fase 6 — Standard di accountability

Ogni analisi deve essere verificabile passo-passo da chiunque. Questo implica:

### In `notes.md` (log cronologico)

```markdown
# Note — [TITOLO ANALISI]

## [DATA] — Fase 0: domanda di ricerca
...

## [DATA] — Fase 1: ricerca dataset
- Comando usato: `opensdmx search "..." --provider ...`
- Dataset trovati: [lista]
- Dataset scelti e motivo: ...
- Dataset esclusi e motivo: ...

## [DATA] — Fase 2: esplorazione dimensioni
- `opensdmx dimensions [ID] --provider ...` → output: [dimensioni trovate]
- Scelta dimensione X = valore Y perché: ...

## [DATA] — Fase 3: download
- Comando: [comando completo]
- Output: [N righe], [N entità], [periodo]
- Anomalie rilevate: [flag, valori mancanti, ecc.]

## [DATA] — Double check
- Run 1 (opensdmx get): [N righe], [valore campione]
- Run 2 (URL diretto):  [N righe], [valore campione]
- Risultato: MATCH ✓ / DIVERGENZA ✗

## [DATA] — Fase 4: trasformazioni
- [operazione] → [risultato]

## [DATA] — Fase 5: grafici
- Dataset [ID]: usato [tipo grafico] perché [motivo tecnico o narrativo]
```

### Nella pagina HTML

Ogni sezione dataset deve avere:

| Elemento | Contenuto richiesto |
|----------|---------------------|
| `.section-label` | Provider + Dataset ID + dimensione chiave |
| `.subtitle` | Unità di misura + filtri + copertura |
| `.transform` | Dati sorgente (righe) + ogni operazione applicata |
| `.note` | Istruzioni di lettura + anomalie + fonte + libreria grafico |
| Sezione Metodologia | URL API Eurostat (o comando CLI per OECD) + YAML riproducibile |
| Sezione Dati grezzi | Link download CSV + righe + copertura + data estrazione + licenza |

### Cosa NON fare

- Non modificare mai i CSV in `output/` a mano
- Non omettere il blocco trasformazioni anche se banale ("nessuna trasformazione applicata")
- Non usare dati interpolati senza dichiararlo esplicitamente
- Non pubblicare URL API senza averli verificati cliccandoli
- Non scegliere un tipo di grafico che distorce la percezione (es. area chart per dati non cumulativi)
- **Non troncare la scala Y**: l'asse Y non può mai partire da un valore diverso da zero. Una scala troncata (es. Y da 40 a 55 invece di 0 a 55) è una distorsione visiva che ingigantisce variazioni marginali

---

## Fase 7 — Executive Summary narrativo

### Quando eseguire questa fase

Solo dopo che sono stati completati:
- Fase 5 (pagina HTML con tutte le sezioni e i grafici renderizzati)
- Fase 6 (checklist pre-pubblicazione superata)

Il summary viene scritto per **ultimo** e posizionato per **primo** nella pagina,
dentro il campo `introExtra` del config `initShell()`.

---

### Step 1 — Inventario dei pattern (annotare in `notes.md`)

Prima di scrivere una sola parola, identificare sistematicamente i pattern
disponibili. Per ognuno, scrivere il valore esatto ricavato dai dati.

**Asse temporale** — disponibile se il report contiene almeno un grafico
`chart.xkcd.XY` con 5+ anni di dati:
- Qual è il delta tra anno iniziale e anno finale per la serie principale?
- Esiste un punto di picco o di minimo? In quale anno?
- Il trend è monotono o ha avuto inversioni rilevanti?
- Fonte: array JS dei grafici XY, blocchi `.transform` nelle sezioni HTML.

**Confronto tra paesi** — disponibile se il report contiene almeno un
`roughViz.BarH` con 5+ entità:
- Qual è il range tra il valore più alto e il più basso (anno più recente)?
- Qual è il rapporto tra il primo e l'ultimo? (es. "4× più alto")
- Esistono outlier che sorprendono per posizione geografica o reputazione?
- Fonte: array JS dei grafici BarH (primo e ultimo elemento per valore).

**Finding 'sorpresa'** — identificarlo attivamente:
- Esiste un risultato che contraddice l'assunzione comune sul tema?
- Esiste una correlazione inattesa tra due sezioni diverse del report?
- Un paese si comporta in modo opposto alla sua reputazione?
- Il gruppo "svantaggiato" atteso risulta invece favorito (o viceversa)?
- Fonte: confronto incrociato tra sezioni, non una singola sezione.

Annotare i 3–5 pattern più forti trovati in `notes.md`:

```markdown
## [DATA] — Fase 7: pattern per executive summary
- Temporale: [descrizione + valore con anno]
- Paese: [range + outlier]
- Sorpresa: [finding con due valori da sezioni diverse]
```

---

### Step 2 — Regole di scrittura

- **3–4 paragrafi** di 4–6 righe ciascuno. Non più.
- Ogni paragrafo deve integrare **almeno 2 angoli** tra: temporale,
  confronto tra paesi, sorpresa. Non scrivere paragrafi mono-tematici.
- **Ogni claim deve citare un numero esatto** con anno e unità, ricavato
  dai dati scaricati. Zero valori inventati o approssimati a memoria.
- **Ogni sezione citata deve avere un link** `<a href="#id-sezione">` alla
  sezione HTML corrispondente. Non citare dati senza indicare dove trovarli.
- Non ripetere i valori già presenti nelle `findingCards`.
- La lingua del summary segue la lingua scelta in Fase 0.

**Adattamento in base ai dati disponibili**

Non tutti i report hanno serie storiche, confronti internazionali o finding
sorpresa. Prima di scrivere, verificare la disponibilità di ciascun angolo:

| Angolo | Disponibile se... | Se non disponibile |
|---|---|---|
| Temporale | almeno un grafico XY con 5+ anni | compensare con più profondità sugli altri due angoli |
| Confronto paesi | almeno un BarH con 5+ entità | compensare con granularità interna (es. per età, settore) |
| Sorpresa | esiste un risultato che inverte un'assunzione — identificarlo attivamente | se genuinamente assente, non inventarne uno; usare due paragrafi temporali e due di confronto |

Non scrivere paragrafi generici per "riempire" uno schema.

---

### Step 3 — Template HTML per `introExtra`

Inserire il summary nel campo `introExtra` di `initShell()`.
Il titolo della sezione è nella lingua del report (es. "What the data says",
"Cosa dicono i dati", "Ce que disent les données").

```js
introExtra: `
  <div class="summary mb-5">
    <h3 class="mb-3">[Titolo in lingua del report]</h3>
    <p>
      [Paragrafo 1: apre con il finding principale o con il trend più forte.
      Integra almeno un valore con anno e almeno un confronto tra paesi o gruppi.
      Chiude con una tensione non risolta che invita a leggere oltre.]
      → <a href="#[id-sezione]">chart [ID]</a>
    </p>
    <p>
      [Paragrafo 2: introduce una seconda dimensione (genere, età, settore,
      area geografica). Mostra dove il pattern cambia tra paesi o nel tempo.
      Cita almeno due valori concreti da sezioni diverse.]
      → <a href="#[id-sezione]">chart [ID]</a>
    </p>
    <p>
      [Paragrafo 3: il finding 'sorpresa'. Un risultato che contraddice
      l'assunzione prevalente sul tema. Supportato da almeno due valori
      concreti da sezioni diverse, con link a entrambe le sezioni.]
      → <a href="#[id-sezione-1]">chart [ID1]</a>,
         <a href="#[id-sezione-2]">chart [ID2]</a>
    </p>
    <!-- Paragrafo 4 opzionale: implicazioni o domanda aperta -->
  </div>
`,
```

---

## Checklist pre-pubblicazione

- [ ] `reports.json` aggiornato con la nuova entry (order, path, date, title, desc, badges)
- [ ] Ogni dataset ha il blocco "Double check passed" in Metodologia (run 1 + run 2 coincidono)
- [ ] `notes.md` contiene tutte le fasi con comandi esatti
- [ ] Ogni CSV in `output/` ha il file YAML corrispondente in `queries/`
- [ ] **Metadata**: La cartella `metadata/` contiene le codelist (CSV) per ogni dimensione filtrata o visualizzata
- [ ] La pagina apre e i grafici si renderizzano senza errori in console
- [ ] **Contenitori**: `roughViz` usa `<div>`, `chart.xkcd` usa `<svg>`
- [ ] Tutti i link `↓ CSV` funzionano (test locale)
- [ ] **Link reali**: Sostituiti tutti i placeholder `[URL...]` con link effettivi (es. GitHub delle librerie)
- [ ] Gli URL API Eurostat nella sezione Metodologia restituiscono dati se cliccati
- [ ] Il blocco `.transform` è presente in ogni sezione dataset
- [ ] **Data di generazione**: presente in formato `GG mese AAAA` (italiano) in tutti e tre i punti: `initShell({ date })`, callout Dati grezzi, footer
- [ ] La sezione Dati grezzi indica data di estrazione e licenza
- [ ] Il callout "Limite di scope" nella sezione Intro è presente e accurato
- [ ] **Baseline a zero**: tutti i grafici hanno l'asse Y che parte da zero — nessuna scala troncata
- [ ] Nessun `font-size` sotto `1rem` nelle configurazioni JS dei grafici (`axisFontSize`, `titleFontSize`, `labelFontSize`) — roughViz scrive questi valori come inline style sull'SVG, che il CSS non può sovrascrivere senza `!important`; il parametro JS è l'unico punto di controllo affidabile
- [ ] **Executive Summary**: `introExtra` compilato con 3–4 paragrafi, ogni claim cita un valore esatto con anno, ogni sezione citata ha un `<a href>` funzionante
