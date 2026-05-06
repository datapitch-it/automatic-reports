var _shellCfg = null;

function _renderShell(cfg) {
  var $ = function(id) { return document.getElementById(id); };
  var isIt = document.body.classList.contains('lang-it');
  function t(en, it) { return isIt ? (it !== undefined ? it : en) : en; }

  // ── NAV + HEADER ─────────────────────────────────────────────────────────
  var navLinks = [
    '<a class="nav-link" href="../../">← Home</a>',
    '<a class="nav-link" href="#intro">↓ Intro</a>'
  ];
  (cfg.nav || []).forEach(function(n) {
    navLinks.push('<a class="nav-link" href="#' + n.id + '">' + t(n.label_en || n.label, n.label) + '</a>');
  });
  navLinks.push('<a class="nav-link" href="#dati">' + t('Raw data', 'Dati grezzi') + '</a>');
  navLinks.push('<a class="nav-link" href="#metodologia">' + t('Methodology', 'Metodologia') + '</a>');

  var badgesHtml = (cfg.badges || []).map(function(b) {
    return '<span class="ds-badge"><strong>' + b.label + '</strong> ' + b.value + '</span>';
  }).join('\n      ');

  var titleHtml  = t(cfg.title_en  || cfg.title,  cfg.title);
  var introHtml  = t(cfg.intro_en  || cfg.intro,  cfg.intro);
  var dateHtml   = t(cfg.date_en   || cfg.date,   cfg.date);
  var eyebrow    = 'JournAI · ' + t('AI-generated report', 'Report generato da AI') + ' · ' + dateHtml + ' · opensdmx CLI';

  var shellTop = $('shell-top');
  var navEl = document.getElementById('shell-nav') || document.createElement('nav');
  navEl.id = 'shell-nav';
  navEl.className = 'site-nav navbar sticky-top py-2';
  navEl.innerHTML =
    '<div class="container">\n' +
    '  <div class="d-flex flex-wrap gap-1">\n' +
    '    ' + navLinks.join('\n    ') + '\n' +
    '  </div>\n' +
    '</div>';
  if (!navEl.parentNode) {
    shellTop.parentNode.insertBefore(navEl, shellTop);
  }

  shellTop.innerHTML =
    '<header class="site-header py-5">\n' +
    '  <div class="container">\n' +
    '    <p class="eyebrow mb-2">' + eyebrow + '</p>\n' +
    '    <h1 class="mb-3">' + titleHtml + '</h1>\n' +
    '    <p class="intro mb-3" style="max-width:720px;">' + introHtml + '</p>\n' +
    '    <div class="d-flex flex-wrap gap-2">\n' +
    '      ' + badgesHtml + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</header>';

  // ── INTRO ────────────────────────────────────────────────────────────────
  var cardsHtml = (cfg.findingCards || []).map(function(c) {
    var cls = (c.color && c.color !== 'default' && c.color !== 'accent') ? ' ' + c.color : '';
    return '<div class="col">\n' +
      '        <div class="finding-card">\n' +
      '          <div class="big-num' + cls + ' mb-2">' + c.value + '</div>\n' +
      '          <p class="mb-0">' + t(c.label_en || c.label, c.label) + '</p>\n' +
      '        </div>\n' +
      '      </div>';
  }).join('\n      ');

  var introTitle     = t(cfg.introTitle_en    || 'Context and findings', cfg.introTitle    || 'Contesto e risultati');
  var introSubRaw    = t(cfg.introSubtitle_en || cfg.introSubtitle,      cfg.introSubtitle || '');
  var introSubtitle  = introSubRaw ? '<p class="subtitle mb-4">' + introSubRaw + '</p>' : '';
  var scopeRaw       = t(cfg.scopeLimit_en    || cfg.scopeLimit,         cfg.scopeLimit    || '');
  var scopeHtml      = scopeRaw
    ? '<div class="callout p-3 mb-4"><strong>' + t('Scope limit:', 'Limite di scope:') + '</strong> ' + scopeRaw + '</div>'
    : '';
  var introExtraHtml = t(cfg.introExtra_en || cfg.introExtra || '', cfg.introExtra || '');

  var rqHtml = '';
  if (cfg.researchQuestion) {
    var rqText = t(cfg.researchQuestion_en || cfg.researchQuestion, cfg.researchQuestion);
    rqHtml =
      '<div class="rq-block mb-4">\n' +
      '  <p class="section-label mb-2">' + t('Research question', 'Domanda di ricerca') + '</p>\n' +
      '  <blockquote class="rq-text mb-0">' + rqText + '</blockquote>\n' +
      '</div>';
  }

  var proxyHtml = '';
  if (cfg.statisticalProxy) {
    var proxyText = t(cfg.statisticalProxy_en || cfg.statisticalProxy, cfg.statisticalProxy);
    proxyHtml =
      '<div class="proxy-block mb-4">\n' +
      '  <p class="section-label mb-2">' + t('Statistical proxy (AI-Gen)', 'Proxy statistico (AI-Gen)') + '</p>\n' +
      '  <p class="proxy-text mb-0">' + proxyText + '</p>\n' +
      '</div>';
  }

  $('shell-intro').innerHTML =
    '<section class="section py-5" id="intro">\n' +
    '  <div class="container">\n' +
    '    <p class="section-label mb-1">' + t('Context', 'Contesto') + '</p>\n' +
    '    <h2 class="mb-2">' + introTitle + '</h2>\n' +
    '    ' + introSubtitle + '\n' +
    '    ' + rqHtml + '\n' +
    '    ' + proxyHtml + '\n' +
    '    ' + scopeHtml + '\n' +
    '    ' + introExtraHtml + '\n' +
    '    <div class="row row-cols-2 row-cols-md-4 g-3">\n' +
    '      ' + cardsHtml + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</section>';

  // ── RAW DATA ─────────────────────────────────────────────────────────────
  var rd = cfg.rawData || {};
  var fileCardsHtml = (rd.files || []).map(function(f) {
    return '\n      <div class="col">\n' +
      '        <div class="h-100 p-3" style="background:#fff;border:1px solid var(--rule);">\n' +
      '          <div class="dl-label mb-1">' + f.provider + ' ' + f.datasetId + '</div>\n' +
      '          <div class="dl-title mb-1">' + t(f.desc_en || f.desc, f.desc) + '</div>\n' +
      '          <div class="dl-meta mb-2">' + f.rows + ' ' + t('rows', 'righe') + ' · ' + f.period + '</div>\n' +
      '          <a class="dl-link" href="' + f.file + '" download>↓ CSV</a>\n' +
      '        </div>\n' +
      '      </div>';
  }).join('');

  // ── METHODOLOGY ──────────────────────────────────────────────────────────
  var m = cfg.methodology || {};

  var githubNote = m.githubUrl
    ? '<p class="note pt-2 mb-4">' +
      t('All files for this report are available on', 'Tutti i file di questo report sono disponibili su') +
      ' <a href="' + m.githubUrl + '" target="_blank">GitHub</a>.</p>'
    : '';

  var classifHtml = '';
  if (m.classifications && m.classifications.length) {
    var rows = m.classifications.map(function(c) {
      return '<tr><td><code>' + c.code + '</code></td>' +
        '<td>' + t(c.system_en  || c.system,  c.system)  + '</td>' +
        '<td>' + t(c.meaning_en || c.meaning, c.meaning) + '</td></tr>';
    }).join('\n        ');
    classifHtml =
      '  <h3 class="subsection-title mt-4 mb-3">' + t('Classifications used', 'Classificazioni usate') + '</h3>\n' +
      '  <div class="table-responsive mb-4">\n' +
      '    <table class="data-table table table-bordered table-sm">\n' +
      '      <thead><tr>' +
        '<th>' + t('Code',    'Codice')     + '</th>' +
        '<th>' + t('System',  'Sistema')    + '</th>' +
        '<th>' + t('Meaning', 'Significato') + '</th>' +
      '</tr></thead>\n' +
      '      <tbody>\n        ' + rows + '\n      </tbody>\n' +
      '    </table>\n  </div>';
  }

  var extraHtml = t(m.extra_en || m.extra || '', m.extra || '');

  var urlsHtml = '';
  if (m.apiUrls && m.apiUrls.length) {
    var urlItems = m.apiUrls.map(function(u) {
      return '  <p class="mb-1" style="color:var(--ink-faint);font-family:var(--mono);">' +
        u.datasetId + ' — ' + u.provider + ' (' + t(u.desc_en || u.desc, u.desc) + ')</p>\n' +
        '  <div class="query-url p-2 mb-3"><a href="' + u.url + '" target="_blank">' + u.url + '</a></div>';
    }).join('\n');
    urlsHtml =
      '  <h3 class="subsection-title mt-4 mb-3">' + t('Original SDMX API query URLs', 'URL API SDMX delle query originali') + '</h3>\n' +
      '  <p class="mb-2" style="color:var(--ink-light);">' +
        t('Exact URLs used to download the data. Clickable or paste-able in any HTTP client.',
          'URL esatti usati per scaricare i dati. Cliccabili o incollabili in qualsiasi client HTTP.') +
      '</p>\n' + urlItems;
  }

  var cliHdr = m.cliHeader || 'Dataset';
  var cliHtml = '';
  if (m.cliCommands && m.cliCommands.length) {
    var cliRows = m.cliCommands.map(function(c) {
      return '<tr><td>' + c.dataset + '</td><td><code>' + c.command + '</code></td></tr>';
    }).join('\n        ');
    cliHtml =
      '  <h3 class="subsection-title mt-4 mb-3">' + t('CLI commands to reproduce the data', 'Comandi CLI per riprodurre i dati') + '</h3>\n' +
      '  <div class="table-responsive mb-4">\n' +
      '    <table class="data-table table table-bordered table-sm">\n' +
      '      <thead><tr><th>' + cliHdr + '</th><th>' + t('Command', 'Comando') + '</th></tr></thead>\n' +
      '      <tbody>\n        ' + cliRows + '\n      </tbody>\n' +
      '    </table>\n  </div>';
  }

  var filesHtml = '';
  if (m.files && m.files.length) {
    var fileRows = m.files.map(function(f) {
      return '<tr><td><code>' + f.file + '</code></td><td>' + t(f.desc_en || f.desc, f.desc) + '</td></tr>';
    }).join('\n        ');
    filesHtml =
      '  <h3 class="subsection-title mt-4 mb-3">' + t('Available files', 'File disponibili') + '</h3>\n' +
      '  <div class="table-responsive">\n' +
      '    <table class="data-table table table-bordered table-sm">\n' +
      '      <thead><tr><th>File</th><th>' + t('Content', 'Contenuto') + '</th></tr></thead>\n' +
      '      <tbody>\n        ' + fileRows + '\n      </tbody>\n' +
      '    </table>\n  </div>';
  }

  $('shell-bottom').innerHTML =
    '<section class="section py-5" id="dati">\n' +
    '  <div class="container">\n' +
    '    <p class="section-label mb-1">' + t('Raw data', 'Dati grezzi') + '</p>\n' +
    '    <h2 class="mb-2">' + t('Download original data', 'Scarica i dati originali') + '</h2>\n' +
    '    <p class="subtitle mb-4">' +
      t('Data extracted via SDMX API and used for the analyses on this page.',
        'Dati estratti tramite API SDMX e usati per le analisi in questa pagina.') +
    '</p>\n' +
    '    <div class="callout p-3 mb-4">\n' +
    '      ' + t(
        'This is the data <strong>exactly as returned by the API</strong> — no aggregation.',
        'Questi sono i dati <strong>così come restituiti dall\'API</strong> — nessuna aggregazione.'
      ) + '\n' +
    '      ' + t('License:', 'Licenza:') + ' ' + (rd.license || 'CC BY 4.0') + '.\n' +
    '      ' + t('Extraction date:', 'Data di estrazione:') + ' <strong>' + (rd.extractionDate || cfg.date) + '</strong>.\n' +
    '    </div>\n' +
    '    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">' +
    fileCardsHtml + '\n    </div>\n' +
    '  </div>\n</section>\n' +
    '<section class="section py-5" id="metodologia">\n' +
    '  <div class="container">\n' +
    '    <p class="section-label mb-1">' + t('Methodological notes', 'Note metodologiche') + '</p>\n' +
    '    <h2 class="mb-2">' + t('Sources, definitions and reproducibility', 'Fonti, definizioni e riproducibilità') + '</h2>\n' +
    '    <p class="subtitle mb-4">' + t('All data is reproducible via opensdmx CLI.', 'Tutti i dati sono riproducibili tramite opensdmx CLI.') + '</p>\n' +
    '    ' + githubNote + '\n' +
    classifHtml + '\n' +
    extraHtml + '\n' +
    urlsHtml + '\n' +
    cliHtml + '\n' +
    filesHtml + '\n' +
    '  </div>\n</section>';

  // ── FOOTER ───────────────────────────────────────────────────────────────
  var ghSpan = cfg.github
    ? '\n    <span>Repo: <a href="' + cfg.github + '" target="_blank">GitHub</a></span>'
    : '';
  var providersHtml = t(cfg.providers_en || cfg.providers || 'Eurostat', cfg.providers || 'Eurostat');

  $('shell-footer').innerHTML =
    '<footer class="site-footer py-4 mt-2">\n' +
    '  <div class="d-flex flex-wrap gap-4 justify-content-between">\n' +
    '    <span>' + t('Data:', 'Dati:') + ' ' + providersHtml + ' · ' + t('SDMX 2.1 format', 'Formato SDMX 2.1') + '</span>\n' +
    '    <span>' + t('Tool:', 'Strumento:') + ' <a href="https://github.com/ondata/opensdmx/blob/main/docs/skill/README.md">opensdmx CLI</a></span>\n' +
    '    <span>' + t('Charts:', 'Grafici:') + ' <a href="https://github.com/jwilber/roughViz">roughViz</a> · <a href="https://github.com/timqian/chart.xkcd">chart.xkcd</a></span>\n' +
    '    <span>' + dateHtml + '</span>' + ghSpan + '\n' +
    '  </div>\n' +
    '</footer>';
}

function initShell(cfg) {
  _shellCfg = cfg;
  window._reRenderShell = function() { if (_shellCfg) _renderShell(_shellCfg); };
  _renderShell(cfg);
}
