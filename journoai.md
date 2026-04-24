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
reports/
└── 01_slug-del-tema/
    ├── index.html          ← pagina analitica finale (autosufficiente, no server)
    ├── output/             ← CSV scaricati dall'API, mai modificati a mano
    │   ├── A_nome.csv
    │   ├── B_nome.csv
    │   └── ...
    ├── metadata/           ← codelist e metadati scaricati con opensdmx
    ├── charts/             ← grafici standalone opzionali (se servono fuori dalla pagina)
    ├── queries/            ← file YAML con le query riproducibili
    │   ├── A_nome.yaml
    │   └── ...
    └── notes.md            ← log cronologico delle operazioni (vedi sezione Accountability)
└── 02_slug-del-tema/
    ...
```

**Regola**: tutto quello che serve per riprodurre l'analisi deve stare in questa cartella.
`index.html` non deve dipendere da file esterni al server locale.

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

Prima di aprire il terminale, fissare per iscritto in `notes.md`:

```markdown
## Domanda di ricerca
[Cosa si vuole misurare e perché]

## Proxy statistica
[Quale grandezza misurabile in SDMX approssima il fenomeno di interesse]

## Scope
[Cosa i dati SDMX NON coprono — da dichiarare esplicitamente nella pagina]

## Provider candidati
[Eurostat / OECD / ECB / World Bank / ISTAT / altro]
```

---

## Fase 1 — Ricerca dataset con opensdmx

### 1.1 Listare i provider disponibili

```bash
opensdmx providers
```

Output: elenco di provider con ID (es. `estat` per Eurostat, `oecd` per OECD).

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

### 2.3 Salvare la query come YAML riproducibile

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

**Note tecniche fondamentali**:
- **roughViz 1.0.6**: Deve puntare a un contenitore **`<div>`**. La libreria crea l'elemento `<svg>` al suo interno. Se puntata a un `<svg>`, il rendering fallisce o produce sovrapposizioni.
- **chart.xkcd 1.1**: Deve puntare a un elemento **`<svg>`**. Se puntata a un `<div>`, restituisce l'errore `Uncaught TypeError: e.node(...).getComputedTextLength is not a function`.
- `roughViz.Line` ha un bug nel callback `d3.csv` (perde `this`): per serie temporali usare `chart.xkcd.XY` con dati inline.
- `roughViz.BarH` e `roughViz.Bar` **non supportano valori negativi**: la scala x parte da 0 e un valore negativo produce `rect width < 0` con errore console. Se i dati contengono valori negativi, escludere quelle osservazioni dal grafico e documentarle nel blocco `.note` e nel blocco `.transform`.

### Regole per le label dei grafici

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

### 5.2 Template HTML completo

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITOLO] — Ricerca SDMX</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <script src="https://unpkg.com/rough-viz@1.0.6"></script>
  <script src="https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13/runtime.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.xkcd@1.1/dist/chart.xkcd.min.js"></script>
  <style>
    :root {
      --ink:        #1a1a1a;
      --ink-light:  #333;
      --ink-faint:  #666;
      --paper:      #fafaf7;
      --paper-warm: #f5f3ee;
      --rule:       #999;
      --accent:     #b02020;
      --accent2:    #1a6fa8;
      --serif:      'Georgia', 'Times New Roman', serif;
      --mono:       'Courier New', Courier, monospace;
      --bs-body-font-family:   var(--serif);
      --bs-body-color:         var(--ink);
      --bs-body-bg:            var(--paper);
      --bs-border-color:       var(--rule);
      --bs-card-border-radius: 0;
      --bs-card-border-color:  var(--rule);
    }
    html { font-size: 19px; scroll-behavior: smooth; }
    .container { max-width: 1060px; }

    /* ── HEADER (dark) ── */
    .site-header { background: #1a1a1a; border-bottom: 2px solid #000; }
    .eyebrow { font-family: var(--mono); font-size: 1rem; letter-spacing: 0.12em; text-transform: uppercase; color: #888; }
    .site-header h1 { font-size: 2rem; font-weight: normal; line-height: 1.2; color: #fff; }
    .intro { color: #ccc; line-height: 1.7; }
    .ds-badge { font-family: var(--mono); font-size: 1rem; background: #2a2a2a; border: 1px solid #444; padding: 2px 8px; color: #aaa; }
    .ds-badge strong { color: #fff; }

    /* ── NAV (dark) ── */
    .site-nav { background: #1a1a1a !important; border-bottom: 1px solid #333; z-index: 1020; }
    .site-nav .nav-link { font-family: var(--mono); font-size: 1rem; color: #aaa; padding: 3px 10px; border: 1px solid transparent; border-radius: 0; transition: border-color 0.15s, color 0.15s; }
    .site-nav .nav-link:hover { border-color: #555; color: #fff; }

    /* ── SECTIONS ── */
    .section { border-bottom: 1px solid var(--rule); }
    .section:last-child { border-bottom: none; }
    .section-label { font-family: var(--mono); font-size: 1rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); }
    .section h2 { font-size: 1.5rem; font-weight: normal; }
    .section .subtitle { color: var(--ink-light); line-height: 1.5; }
    .subsection-title { font-size: 1rem; font-weight: normal; color: var(--ink); padding-bottom: 0.3rem; border-bottom: 1px dashed var(--rule); }

    /* ── COMPONENTS ── */
    .callout { background: var(--paper-warm); border-left: 3px solid var(--accent); border-top: none; border-right: none; border-bottom: none; border-radius: 0; color: var(--ink-light); }
    .callout strong { color: var(--ink); }

    .finding-card { background: #fff; border: 1px solid var(--rule); padding: 0.9rem 1rem; height: 100%; }
    .big-num { font-size: 2rem; font-family: var(--mono); color: var(--accent); line-height: 1; }
    .big-num.blue { color: var(--accent2); }
    .big-num.green { color: #27ae60; }
    .finding-card p { font-size: 1rem; color: var(--ink-light); line-height: 1.4; }
    .finding-card strong { color: var(--ink); }

    .chart-wrap { background: #fff; border: 1px solid var(--rule); padding: 1.2rem; overflow-x: auto; }
    .chart-wrap svg { display: block; width: 100%; min-height: 380px; }

    .sm-card { background: #fff; border: 1px solid var(--rule); padding: 0.6rem 0.6rem 0; }
    .sm-card h4 { font-size: 1rem; font-family: var(--mono); color: var(--ink-light); padding: 0 0.3rem 0.3rem; border-bottom: 1px dashed var(--rule); margin-bottom: 0.3rem; }
    .sm-card svg { width: 100%; height: 210px; display: block; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; display: inline-block; }

    /* Titolo testuale sopra un grafico, alternativo a quello inline roughViz/xkcd */
    .chart-title-label {
      font-family: var(--mono);
      font-size: 1rem;
      text-transform: uppercase;
      color: var(--ink-faint);
      letter-spacing: 0.08em;
      margin-bottom: 0.5rem;
    }

    .transform { background: var(--paper-warm); border: 1px solid var(--rule); border-left: 3px solid var(--accent2); }
    .transform h4 { font-family: var(--mono); font-size: 1rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); }
    .transform ul { color: var(--ink-light); line-height: 1.7; }
    .transform li code { font-family: var(--mono); font-size: 1rem; background: var(--paper); padding: 1px 4px; border: 1px solid var(--rule); }

    .note { font-size: 1rem; color: var(--ink-faint); border-top: 1px dashed var(--rule); line-height: 1.6; }
    .note code { font-family: var(--mono); font-size: 1rem; background: var(--paper-warm); padding: 1px 4px; border: 1px solid var(--rule); }
    .note a { color: var(--ink-faint); }

    .query-url { background: #fff; border: 1px solid var(--rule); font-family: var(--mono); font-size: 1rem; color: var(--ink-light); word-break: break-all; line-height: 1.6; }
    .query-url a { color: var(--accent2); }

    .data-table { font-size: 1rem; }
    .data-table thead th { background: var(--paper-warm); font-family: var(--mono); font-size: 1rem; font-weight: normal; letter-spacing: 0.05em; border-color: var(--rule); }
    .data-table td { border-color: var(--rule); }
    .data-table tbody tr:nth-child(even) td { background: var(--paper-warm); }
    .data-table code { font-family: var(--mono); font-size: 1rem; background: var(--paper-warm); padding: 1px 4px; color: var(--ink); }

    .dl-label { font-family: var(--mono); font-size: 1rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-faint); }
    .dl-title { color: var(--ink); font-size: 1rem; }
    .dl-meta { font-family: var(--mono); font-size: 1rem; color: var(--ink-faint); }
    a.dl-link { font-family: var(--mono); font-size: 1rem; color: var(--accent2); text-decoration: none; border: 1px solid var(--accent2); padding: 2px 8px; display: inline-block; }
    a.dl-link:hover { background: var(--accent2); color: #fff; }

    .site-footer { border-top: 2px solid var(--ink); font-size: 1rem; color: var(--ink-faint); font-family: var(--mono); }
    .site-footer a { color: var(--ink-faint); }
  </style>
</head>
<body>

<!-- ═══ NAV ═══ -->
<nav class="site-nav navbar sticky-top py-2">
  <div class="container">
    <div class="d-flex flex-wrap gap-1">
      <a class="nav-link" href="#intro">↓ Intro</a>
      <!-- aggiungere un link per ogni sezione dataset -->
      <a class="nav-link" href="#[FASE-ID]">[LABEL SEZIONE]</a>
      <a class="nav-link" href="#dati">Dati grezzi</a>
      <a class="nav-link" href="#metodologia">Metodologia</a>
    </div>
  </div>
</nav>

<!-- ═══ HEADER ═══ -->
<header class="site-header py-5">
  <div class="container">
    <p class="eyebrow mb-2">Ricerca SDMX · [DATA] · opensdmx CLI</p>
    <h1 class="mb-3">[TITOLO PRINCIPALE]</h1>
    <p class="intro mb-3" style="max-width:720px;">
      [Descrizione in 2-3 frasi: cosa si analizza, con quali dati, perché è rilevante.]
    </p>
    <div class="d-flex flex-wrap gap-2">
      <span class="ds-badge"><strong>[Provider]</strong> [Dataset ID]</span>
      <!-- ripetere per ogni dataset -->
      <span class="ds-badge"><strong>Periodo</strong> [YYYY–YYYY]</span>
      <span class="ds-badge"><strong>Paesi</strong> [N]</span>
    </div>
  </div>
</header>

<main class="container py-2">

  <!-- ═══ INTRO ═══ -->
  <section class="section py-5" id="intro">
    <p class="section-label mb-1">Contesto</p>
    <h2 class="mb-2">[Titolo sezione intro]</h2>
    <p class="subtitle mb-4">[Sottotitolo: cosa si misura in una riga]</p>

    <!-- CALLOUT: limiti di scope — OBBLIGATORIO -->
    <div class="callout p-3 mb-4">
      <strong>Limite di scope:</strong> [Cosa questi dati NON coprono e perché.
      Indicare fonti alternative per i dati esclusi.]
    </div>

    <!-- FINDING CARDS: 4 numeri chiave dall'analisi -->
    <div class="row row-cols-2 row-cols-md-4 g-3">
      <div class="col">
        <div class="finding-card">
          <div class="big-num mb-2">[VALORE]</div>
          <p class="mb-0"><strong>[Entità]</strong> — [spiegazione del dato in una riga]</p>
        </div>
      </div>
      <!-- ripetere per ogni finding; usare .blue per accent2 -->
    </div>
  </section>

  <!-- ═══ SEZIONE DATASET (ripetere per ogni dataset) ═══ -->
  <section class="section py-5" id="[fase-id]">
    <p class="section-label mb-1">[Fase X] · [Provider] [Dataset ID] · [dimensione chiave]</p>
    <h2 class="mb-2">[Titolo descrittivo del grafico]</h2>
    <p class="subtitle mb-4">
      [Unità di misura] · [filtri principali] · [numero entità] [tipo entità]
    </p>

    <!-- CALLOUT opzionale: spiega un concetto tecnico necessario per leggere il grafico -->
    <div class="callout p-3 mb-4">
      <strong>[Termine tecnico]:</strong> [spiegazione in linguaggio semplice]
    </div>

    <!-- NOTE "COME LEGGERE" — OBBLIGATORIO, PRIMA DEL GRAFICO -->
    <!-- Posizione: dopo il callout, prima del chart-wrap -->
    <p class="note pt-3 mb-4">
      <strong>Come leggere:</strong> [Spiegazione operativa del grafico in 1-2 frasi.]
      [Avvertenze su dati mancanti, flag, anomalie.]
      Fonte SDMX: <code>[DATASET_ID]</code>, [Provider].
      Grafico: <a href="[URL libreria]">[roughViz / chart.xkcd]</a>.
    </p>

    <!-- GRAFICO -->
    <div class="chart-wrap mb-4">
      <div id="chart-[ID]"></div>
      <!-- oppure per small multiples: usare .sm-card dentro row Bootstrap -->
    </div>

    <!-- BLOCCO TRASFORMAZIONI — OBBLIGATORIO -->
    <div class="transform p-3 mb-4">
      <h4 class="mb-2">Trasformazioni applicate</h4>
      <ul class="mb-0">
        <li>Dati sorgente: [N righe] ([descrizione copertura grezza])</li>
        <li>[Operazione 1]: es. "selezionato l'ultimo anno disponibile per entità"</li>
        <li>[Operazione 2]: es. "escluso [X] perché [motivo]"</li>
        <li>[Operazione 3 se calcolo]: es. "calcolato indice base=[anno]: <code>valore/base×100</code>"</li>
        <li>Nessuna aggregazione / [tipo di aggregazione applicata]</li>
      </ul>
    </div>
  </section>

  <!-- ═══ DATI GREZZI ═══ -->
  <section class="section py-5" id="dati">
    <p class="section-label mb-1">Dati grezzi</p>
    <h2 class="mb-2">Scarica i dati originali</h2>
    <p class="subtitle mb-4">
      Dati estratti da [Provider/i] tramite API SDMX e usati per le analisi in questa pagina.
    </p>
    <div class="callout p-3 mb-4">
      Questi sono i dati <strong>così come restituiti dall'API</strong> — nessuna aggregazione.
      Licenza: [es. Eurostat CC BY 4.0 / OECD CC BY-NC-SA 3.0].
      Data di estrazione: <strong>[DATA]</strong>.
    </div>
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
      <!-- ripetere per ogni file CSV -->
      <div class="col">
        <div class="h-100 p-3" style="background:#fff;border:1px solid var(--rule);">
          <div class="dl-label mb-1">[Provider] [Dataset ID]</div>
          <div class="dl-title mb-1">[Descrizione breve]</div>
          <div class="dl-meta mb-2">[N righe] · [N entità] · [periodo]</div>
          <a class="dl-link" href="output/[FILENAME].csv" download>↓ CSV</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ METODOLOGIA ═══ -->
  <section class="section py-5" id="metodologia">
    <p class="section-label mb-1">Note metodologiche</p>
    <h2 class="mb-2">Fonti, definizioni e riproducibilità</h2>
    <p class="subtitle mb-4">Tutti i dati sono riproducibili tramite opensdmx CLI.</p>

    <!-- Tabella classificazioni usate -->
    <h3 class="subsection-title mt-4 mb-3">Classificazioni usate</h3>
    <div class="table-responsive mb-4">
      <table class="data-table table table-bordered table-sm">
        <thead><tr><th>Codice</th><th>Sistema</th><th>Significato</th></tr></thead>
        <tbody>
          <tr><td><code>[CODICE]</code></td><td>[Sistema classificatorio]</td><td>[Descrizione]</td></tr>
        </tbody>
      </table>
    </div>

    <!-- URL API per ogni query Eurostat -->
    <h3 class="subsection-title mt-4 mb-3">URL API SDMX delle query originali</h3>
    <p class="mb-2" style="color:var(--ink-light);">
      URL esatti usati per scaricare i dati. Cliccabili o incollabili in qualsiasi client HTTP.
    </p>
    <!-- ripetere per ogni dataset Eurostat -->
    <p class="mb-1" style="color:var(--ink-faint);font-family:var(--mono);">[Dataset ID] — [Provider] ([descrizione])</p>
    <div class="query-url p-2 mb-3">
      <a href="[URL_COMPLETO]" target="_blank">[URL_COMPLETO]</a>
    </div>

    <!-- Comandi CLI -->
    <h3 class="subsection-title mt-4 mb-3">Comandi CLI per riprodurre i dati</h3>
    <div class="table-responsive mb-4">
      <table class="data-table table table-bordered table-sm">
        <thead><tr><th>Dataset</th><th>Comando</th></tr></thead>
        <tbody>
          <tr>
            <td>[ID]</td>
            <td><code>opensdmx run queries/[NOME].yaml --out output/[NOME].csv</code></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- File disponibili -->
    <h3 class="subsection-title mt-4 mb-3">File disponibili</h3>
    <div class="table-responsive">
      <table class="data-table table table-bordered table-sm">
        <thead><tr><th>File</th><th>Contenuto</th></tr></thead>
        <tbody>
          <tr><td><code>output/[NOME].csv</code></td><td>[N righe] · [descrizione]</td></tr>
          <tr><td><code>queries/[NOME].yaml</code></td><td>Query riproducibile per [dataset]</td></tr>
        </tbody>
      </table>
    </div>
  </section>

</main>

<!-- ═══ FOOTER ═══ -->
<footer class="site-footer py-4 mt-2">
  <div class="container d-flex flex-wrap gap-4 justify-content-between">
    <span>Dati: [Provider/i] · Formato SDMX 2.1</span>
    <span>Strumento: <a href="https://github.com/ondata/opensdmx/blob/main/docs/skill/README.md">opensdmx CLI</a></span>
    <span>Grafici: <a href="https://github.com/jwilber/roughViz">roughViz</a> · <a href="https://github.com/timqian/chart.xkcd">chart.xkcd</a></span>
    <span>[DATA]</span>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
// ── SEZIONE [ID] ───────────────────────────────────────────────────────────
// [Commento: quale dataset, quale trasformazione è stata applicata per ottenere questi valori]
const labels[ID] = [/* array valori etichette */];
const values[ID] = [/* array valori numerici */];

new roughViz.BarH({ /* oppure chart.xkcd.XY, ecc. */ });
</script>
</body>
</html>
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

---

## Checklist pre-pubblicazione

- [ ] `notes.md` contiene tutte le fasi con comandi esatti
- [ ] Ogni CSV in `output/` ha il file YAML corrispondente in `queries/`
- [ ] **Metadata**: La cartella `metadata/` contiene le codelist (CSV) per ogni dimensione filtrata o visualizzata
- [ ] La pagina apre e i grafici si renderizzano senza errori in console
- [ ] **Contenitori**: `roughViz` usa `<div>`, `chart.xkcd` usa `<svg>`
- [ ] Tutti i link `↓ CSV` funzionano (test locale)
- [ ] **Link reali**: Sostituiti tutti i placeholder `[URL...]` con link effettivi (es. GitHub delle librerie)
- [ ] Gli URL API Eurostat nella sezione Metodologia restituiscono dati se cliccati
- [ ] Il blocco `.transform` è presente in ogni sezione dataset
- [ ] **Data di generazione**: presente in formato `GG mese AAAA` (italiano) in tutti e tre i punti obbligatori: eyebrow header, callout Dati grezzi, footer
- [ ] La sezione Dati grezzi indica data di estrazione e licenza
- [ ] Il callout "Limite di scope" nella sezione Intro è presente e accurato
- [ ] Nessun `font-size` sotto `1rem` nel CSS
- [ ] Nessun `font-size` sotto `1rem` nelle configurazioni JS dei grafici (`axisFontSize`, `titleFontSize`, `labelFontSize`) — roughViz scrive questi valori come inline style sull'SVG, che il CSS non può sovrascrivere senza `!important`; il parametro JS è l'unico punto di controllo affidabile
