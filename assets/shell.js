function initShell(cfg) {
  var $ = function(id) { return document.getElementById(id); };

  // ── NAV + HEADER ─────────────────────────────────────────────────────────
  var navLinks = ['<a class="nav-link" href="../../index.html">← Home</a>', '<a class="nav-link" href="#intro">↓ Intro</a>'];
  (cfg.nav || []).forEach(function(n) {
    navLinks.push('<a class="nav-link" href="#' + n.id + '">' + n.label + '</a>');
  });
  navLinks.push('<a class="nav-link" href="#dati">Dati grezzi</a>');
  navLinks.push('<a class="nav-link" href="#metodologia">Metodologia</a>');

  var badgesHtml = (cfg.badges || []).map(function(b) {
    return '<span class="ds-badge"><strong>' + b.label + '</strong> ' + b.value + '</span>';
  }).join('\n      ');

  $('shell-top').innerHTML =
    '<nav class="site-nav navbar sticky-top py-2">\n' +
    '  <div class="container">\n' +
    '    <div class="d-flex flex-wrap gap-1">\n' +
    '      ' + navLinks.join('\n      ') + '\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</nav>\n' +
    '<header class="site-header py-5">\n' +
    '  <div class="container">\n' +
    '    <p class="eyebrow mb-2">Ricerca SDMX · ' + cfg.date + ' · opensdmx CLI</p>\n' +
    '    <h1 class="mb-3">' + cfg.title + '</h1>\n' +
    '    <p class="intro mb-3" style="max-width:720px;">' + cfg.intro + '</p>\n' +
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
      '          <p class="mb-0">' + c.label + '</p>\n' +
      '        </div>\n' +
      '      </div>';
  }).join('\n      ');

  var introTitle = cfg.introTitle || 'Contesto e risultati';
  var introSubtitle = cfg.introSubtitle
    ? '<p class="subtitle mb-4">' + cfg.introSubtitle + '</p>' : '';
  var scopeHtml = cfg.scopeLimit
    ? '<div class="callout p-3 mb-4"><strong>Limite di scope:</strong> ' + cfg.scopeLimit + '</div>' : '';

  var introExtraHtml = cfg.introExtra || '';

  $('shell-intro').innerHTML =
    '<section class="section py-5" id="intro">\n' +
    '  <div class="container">\n' +
    '    <p class="section-label mb-1">Contesto</p>\n' +
    '    <h2 class="mb-2">' + introTitle + '</h2>\n' +
    '    ' + introSubtitle + '\n' +
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
      '          <div class="dl-title mb-1">' + f.desc + '</div>\n' +
      '          <div class="dl-meta mb-2">' + f.rows + ' righe · ' + f.period + '</div>\n' +
      '          <a class="dl-link" href="' + f.file + '" download>↓ CSV</a>\n' +
      '        </div>\n' +
      '      </div>';
  }).join('');

  // ── METHODOLOGY ──────────────────────────────────────────────────────────
  var m = cfg.methodology || {};

  var githubNote = m.githubUrl
    ? '<p class="note pt-2 mb-4">Tutti i file di questo report sono disponibili su <a href="' + m.githubUrl + '" target="_blank">GitHub</a>.</p>'
    : '';

  var classifHtml = '';
  if (m.classifications && m.classifications.length) {
    var rows = m.classifications.map(function(c) {
      return '<tr><td><code>' + c.code + '</code></td><td>' + c.system + '</td><td>' + c.meaning + '</td></tr>';
    }).join('\n        ');
    classifHtml =
      '  <h3 class="subsection-title mt-4 mb-3">Classificazioni usate</h3>\n' +
      '  <div class="table-responsive mb-4">\n' +
      '    <table class="data-table table table-bordered table-sm">\n' +
      '      <thead><tr><th>Codice</th><th>Sistema</th><th>Significato</th></tr></thead>\n' +
      '      <tbody>\n        ' + rows + '\n      </tbody>\n' +
      '    </table>\n  </div>';
  }

  var extraHtml = m.extra || '';

  var urlsHtml = '';
  if (m.apiUrls && m.apiUrls.length) {
    var urlItems = m.apiUrls.map(function(u) {
      return '  <p class="mb-1" style="color:var(--ink-faint);font-family:var(--mono);">' +
        u.datasetId + ' — ' + u.provider + ' (' + u.desc + ')</p>\n' +
        '  <div class="query-url p-2 mb-3"><a href="' + u.url + '" target="_blank">' + u.url + '</a></div>';
    }).join('\n');
    urlsHtml =
      '  <h3 class="subsection-title mt-4 mb-3">URL API SDMX delle query originali</h3>\n' +
      '  <p class="mb-2" style="color:var(--ink-light);">URL esatti usati per scaricare i dati. Cliccabili o incollabili in qualsiasi client HTTP.</p>\n' +
      urlItems;
  }

  var cliHdr = m.cliHeader || 'Dataset';
  var cliHtml = '';
  if (m.cliCommands && m.cliCommands.length) {
    var cliRows = m.cliCommands.map(function(c) {
      return '<tr><td>' + c.dataset + '</td><td><code>' + c.command + '</code></td></tr>';
    }).join('\n        ');
    cliHtml =
      '  <h3 class="subsection-title mt-4 mb-3">Comandi CLI per riprodurre i dati</h3>\n' +
      '  <div class="table-responsive mb-4">\n' +
      '    <table class="data-table table table-bordered table-sm">\n' +
      '      <thead><tr><th>' + cliHdr + '</th><th>Comando</th></tr></thead>\n' +
      '      <tbody>\n        ' + cliRows + '\n      </tbody>\n' +
      '    </table>\n  </div>';
  }

  var filesHtml = '';
  if (m.files && m.files.length) {
    var fileRows = m.files.map(function(f) {
      return '<tr><td><code>' + f.file + '</code></td><td>' + f.desc + '</td></tr>';
    }).join('\n        ');
    filesHtml =
      '  <h3 class="subsection-title mt-4 mb-3">File disponibili</h3>\n' +
      '  <div class="table-responsive">\n' +
      '    <table class="data-table table table-bordered table-sm">\n' +
      '      <thead><tr><th>File</th><th>Contenuto</th></tr></thead>\n' +
      '      <tbody>\n        ' + fileRows + '\n      </tbody>\n' +
      '    </table>\n  </div>';
  }

  $('shell-bottom').innerHTML =
    '<section class="section py-5" id="dati">\n' +
    '  <div class="container">\n' +
    '    <p class="section-label mb-1">Dati grezzi</p>\n' +
    '    <h2 class="mb-2">Scarica i dati originali</h2>\n' +
    '    <p class="subtitle mb-4">Dati estratti tramite API SDMX e usati per le analisi in questa pagina.</p>\n' +
    '    <div class="callout p-3 mb-4">\n' +
    '      Questi sono i dati <strong>così come restituiti dall\'API</strong> — nessuna aggregazione.\n' +
    '      Licenza: ' + (rd.license || 'CC BY 4.0') + '.\n' +
    '      Data di estrazione: <strong>' + (rd.extractionDate || cfg.date) + '</strong>.\n' +
    '    </div>\n' +
    '    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">' +
    fileCardsHtml + '\n    </div>\n' +
    '  </div>\n</section>\n' +
    '<section class="section py-5" id="metodologia">\n' +
    '  <div class="container">\n' +
    '    <p class="section-label mb-1">Note metodologiche</p>\n' +
    '    <h2 class="mb-2">Fonti, definizioni e riproducibilità</h2>\n' +
    '    <p class="subtitle mb-4">Tutti i dati sono riproducibili tramite opensdmx CLI.</p>\n' +
    '    ' + githubNote + '\n' +
    classifHtml + '\n' +
    extraHtml + '\n' +
    urlsHtml + '\n' +
    cliHtml + '\n' +
    filesHtml + '\n' +
    '  </div>\n</section>';

  // ── FOOTER ───────────────────────────────────────────────────────────────
  var ghSpan = cfg.github
    ? '\n    <span>Repo: <a href="' + cfg.github + '" target="_blank">GitHub</a></span>' : '';

  $('shell-footer').innerHTML =
    '<footer class="site-footer py-4 mt-2">\n' +
    '  <div class="d-flex flex-wrap gap-4 justify-content-between">\n' +
    '    <span>Dati: ' + (cfg.providers || 'Eurostat') + ' · Formato SDMX 2.1</span>\n' +
    '    <span>Strumento: <a href="https://github.com/ondata/opensdmx/blob/main/docs/skill/README.md">opensdmx CLI</a></span>\n' +
    '    <span>Grafici: <a href="https://github.com/jwilber/roughViz">roughViz</a> · <a href="https://github.com/timqian/chart.xkcd">chart.xkcd</a></span>\n' +
    '    <span>' + cfg.date + '</span>' + ghSpan + '\n' +
    '  </div>\n' +
    '</footer>';
}
