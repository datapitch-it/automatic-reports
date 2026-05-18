# JournAI — Phase 4: Charts

## Libraries

**Default: Chart.js.** Use for all standard chart types.
**Second: D3.js.** Only when Chart.js cannot produce the required output (maps, network graphs,
complex custom layouts). Document the reason in `data-design.md` before building.

No other charting libraries are permitted. Static image charts (`<img>`) are forbidden
(Constitution Article 7). Every chart must be interactive with tooltips.

---

## Global setup (Chart.js)

Set defaults once at the top of the `<script>` block, before any chart instantiation:

```javascript
Chart.defaults.font.family = "'IBM Plex Mono', monospace";
Chart.defaults.font.size   = 14;
Chart.defaults.color       = '#333';
```

Do not repeat font configuration on individual axes or datasets.

---

## Container rules

| Library | Container | Notes |
|---|---|---|
| Chart.js | `<canvas>` | Set `maintainAspectRatio: false`; control height via wrapper CSS |
| D3 | `<svg>` | Manage width/height via parent wrapper, not inline SVG attributes |

For Chart.js, measure width from the wrapper at render time if pixel width is needed:

```javascript
const wrap = document.querySelector('#chart-A').closest('.chart-wrap');
const s    = window.getComputedStyle(wrap);
const w    = Math.floor(wrap.clientWidth
               - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight));
```

---

## Visual rules (all charts)

- **UPPERCASE mandatory**: all axis titles, tick labels, legend labels, tooltip strings.
  Pass strings already uppercase or use `.map(s => s.toUpperCase())`.
- **Axis labels**: never omit. Always include the unit of measurement
  (e.g. `"% OF GDP"`, `"PERSONS"`, `"RATE PER 100K"`).
- **Tooltips**: always enabled. At minimum show entity label and value with unit.
- **Y-axis zero baseline**:
  - Absolute values (€, persons, kg, km²): set `min: 0` explicitly. No exceptions.
  - Rates, percentages, indices: use auto-scaled range. Add a sentence in the `.note`
    block explaining why zero is not shown (e.g. "The Y-axis is auto-scaled — starting
    at zero would compress the meaningful variation without adding information").
  - Never add synthetic data points to force a baseline.
- **Colour palette**:
  ```
  Red   (primary):   #b02020   hover: #c0392b
  Blue  (secondary): #1a6fa8   hover: #2980b9
  Green:  #27ae60
  Orange: #e67e22
  Purple: #8e44ad
  Teal:   #16a085
  ```

---

## Chart.js — Horizontal bar (ranking)

Use for: rankings, cross-entity comparisons at a point in time.
Container: `<canvas>`.

```javascript
// HTML: <div class="chart-wrap" style="height:400px"><canvas id="chart-A"></canvas></div>

new Chart(document.getElementById('chart-A'), {
  type: 'bar',
  data: {
    labels: ['COUNTRY A', 'COUNTRY B', 'COUNTRY C'],  // UPPERCASE, sorted by value
    datasets: [{
      label: 'SERIES LABEL',
      data:  [12.4, 9.1, 7.8],
      backgroundColor: '#b02020',
      hoverBackgroundColor: '#c0392b',
      borderWidth: 0,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.x.toFixed(1)} % OF GDP`
        }
      }
    },
    scales: {
      x: {
        min: 0,   // mandatory for absolute values; omit for rates (add .note explanation)
        title: { display: true, text: '% OF GDP' },
        grid: { color: '#eee' }
      },
      y: {
        ticks: { font: { size: 13 } }
      }
    }
  }
});
```

Height rule: approximately 30px per bar + 60px for margins.
For 20 countries: `style="height:660px"` on the wrapper.

---

## Chart.js — Line chart (time series)

Use for: trends over time, one or multiple series.
Container: `<canvas>`.

```javascript
// HTML: <div class="chart-wrap" style="height:320px"><canvas id="chart-B"></canvas></div>

const years  = [2000, 2001, 2002, 2003]; // x-axis labels
const values = [1.8, 1.9, null, 2.1];    // null = missing year (Chart.js spans the gap)

new Chart(document.getElementById('chart-B'), {
  type: 'line',
  data: {
    labels: years,
    datasets: [{
      label: 'ITALY',
      data:  values,
      borderColor:           '#b02020',
      backgroundColor:       'transparent',
      pointRadius:           4,
      pointHoverRadius:      6,
      spanGaps:              true,   // connect across null values
      borderWidth:           2,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1) ?? 'N/A'} %`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'YEAR' } },
      y: {
        // min: 0,   // set for absolute values; omit for rates + add .note
        title: { display: true, text: '% OF GDP' },
        grid: { color: '#eee' }
      }
    }
  }
});
```

For **multi-series** (one line per country or group):

```javascript
datasets: [
  { label: 'ITALY',  data: [...], borderColor: '#b02020' },
  { label: 'FRANCE', data: [...], borderColor: '#1a6fa8' },
  { label: 'EU27',   data: [...], borderColor: '#27ae60', borderDash: [5, 5] },
]
```

For **small multiples** (one chart per entity):

```javascript
Object.entries(seriesData).forEach(([country, values]) => {
  new Chart(document.getElementById(`chart-${country}`), { /* config */ });
});
```

---

## Chart.js — Vertical bar chart

Use for: categorical comparisons, period-over-period bars.
Container: `<canvas>`.

```javascript
new Chart(document.getElementById('chart-C'), {
  type: 'bar',
  data: {
    labels: ['2015', '2016', '2017', '2018'],
    datasets: [{
      label: 'EXPENDITURE',
      data:  [234, 241, 258, 271],
      backgroundColor: '#b02020',
      hoverBackgroundColor: '#c0392b',
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.parsed.y.toFixed(0)} M€` } }
    },
    scales: {
      y: {
        min: 0,   // mandatory for absolute values
        title: { display: true, text: 'MILLION EURO' }
      }
    }
  }
});
```

---

## Chart.js — Scatter chart

Use for: correlations between two variables across entities.
Container: `<canvas>`.

```javascript
new Chart(document.getElementById('chart-D'), {
  type: 'scatter',
  data: {
    datasets: [{
      label: 'EU COUNTRIES 2023',
      data: [
        { x: 2.1, y: 45.3, label: 'FRANCE' },
        { x: 1.3, y: 38.2, label: 'ITALY'  },
      ],
      backgroundColor: '#b02020',
      pointRadius: 6,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.raw.label}: (${ctx.raw.x}, ${ctx.raw.y})`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'X AXIS LABEL [UNIT]' } },
      y: { min: 0, title: { display: true, text: 'Y AXIS LABEL [UNIT]' } }
    }
  }
});
```

---

## D3 — When to use

Use D3 only when Chart.js cannot produce the required output. Examples:
- Choropleth maps (geographic data by region/country)
- Network or flow graphs
- Custom radial layouts
- Animated transitions between data states

**D3 rules:**
- Container: `<svg>` with a sizing wrapper div.
- Width and height must be measured from the container at render time.
- Tooltips: implement via a `<div>` absolutely positioned over the SVG.
- All text nodes (axis labels, tick labels) must be uppercase.
- Record the reason for using D3 in `data-design.md`.

D3 boilerplate (responsive SVG):

```javascript
const container = document.getElementById('chart-map');
const { width }  = container.getBoundingClientRect();
const height     = Math.round(width * 0.55);

const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// ... D3 rendering code ...
```

---

## HTML section structure

Each dataset section must include the chart and its supporting blocks:

```html
<section class="section py-5" id="[section-id]">
  <p class="section-label mb-1">[Provider] · [DATASET_ID] · [key dimension]</p>
  <h2 class="mb-2">[Descriptive chart title]</h2>
  <p class="subtitle mb-4">[Unit] · [filters] · [N entities]</p>

  <!-- optional callout -->
  <div class="callout mb-4">
    <strong>Key finding</strong> — [One-sentence highlight from the data.]
  </div>

  <!-- chart container — use canvas for Chart.js, svg for D3 -->
  <div class="chart-wrap mb-4" style="height:[Npx]">
    <canvas id="chart-[id]"></canvas>
  </div>

  <!-- transformation block — mandatory even if trivial -->
  <div class="transform p-3 mb-4">
    <strong>Data transformations</strong><br>
    Raw: [X rows, Y countries, YYYY–YYYY] · [operations applied] · Final: [Z observations]
  </div>

  <!-- reading note — mandatory -->
  <p class="note mb-2">
    Source: <a href="[provider dataset URL]">[Provider] [DATASET_ID]</a> ·
    Chart: <a href="https://www.chartjs.org/">Chart.js</a> ·
    [Any anomalies, flags, missing values, or scale note]
  </p>
</section>
```
