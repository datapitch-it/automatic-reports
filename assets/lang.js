(function () {
  var KEY = 'journai-lang';

  // Read ?lang=ITA or ?lang=ENG from the URL; returns 'it', 'en', or null.
  function fromUrl() {
    var v = new URLSearchParams(window.location.search).get('lang');
    if (!v) return null;
    v = v.toUpperCase();
    if (v === 'ITA') return 'it';
    if (v === 'ENG') return 'en';
    return null;
  }

  // Update ?lang= in the URL without reloading and without losing the #hash.
  function updateUrl(lang) {
    var params = new URLSearchParams(window.location.search);
    params.set('lang', lang === 'it' ? 'ITA' : 'ENG');
    history.replaceState(null, '', window.location.pathname + '?' + params.toString() + window.location.hash);
  }

  function stored() { return localStorage.getItem(KEY) || 'en'; }

  function applyLang(lang) {
    document.documentElement.lang = lang;
    document.body.classList.remove('lang-en', 'lang-it');
    document.body.classList.add('lang-' + lang);
    localStorage.setItem(KEY, lang);
    updateUrl(lang);
    var btnEn = document.getElementById('lang-btn-en');
    var btnIt = document.getElementById('lang-btn-it');
    if (btnEn) btnEn.classList.toggle('lang-active', lang === 'en');
    if (btnIt) btnIt.classList.toggle('lang-active', lang === 'it');
    if (window._reRenderShell) window._reRenderShell();
    if (window._reRenderReports) window._reRenderReports();
  }

  function inject() {
    var div = document.createElement('div');
    div.id = 'lang-toggle';
    div.innerHTML =
      '<button id="lang-btn-en" class="lang-btn">ENG</button>' +
      '<span class="lang-sep">|</span>' +
      '<button id="lang-btn-it" class="lang-btn">ITA</button>';
    document.body.appendChild(div);
    document.getElementById('lang-btn-en').onclick = function () { applyLang('en'); };
    document.getElementById('lang-btn-it').onclick = function () { applyLang('it'); };
  }

  // URL param takes priority over localStorage.
  function init() { inject(); applyLang(fromUrl() || stored()); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
