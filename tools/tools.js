// ==========================================================================
// GESTIÓN DE IDIOMAS Y NAVEGACIÓN PARA /tools/
// ==========================================================================
let currentLang = localStorage.getItem('zoruvi_lang') || 'en';

const dictionaries = {
  en: window.i18n_en || {},
  es: window.i18n_es || {},
  pt: window.i18n_pt || {},
  fr: window.i18n_fr || {},
  hi: window.i18n_hi || {},
  pa: window.i18n_pa || {}
};

window.setLanguage = function(lang) {
  currentLang = lang;
  localStorage.setItem('zoruvi_lang', lang);
  document.documentElement.setAttribute('lang', lang);

  const translations = dictionaries[lang] || dictionaries['en'];

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[key]) {
      element.innerHTML = translations[key];
    }
  });

  ['en', 'es', 'pt', 'fr', 'hi', 'pa'].forEach(code => {
    const btn = document.getElementById(`opt-${code}`);
    if (btn) btn.classList.toggle('active', lang === code);
  });

  const menu = document.getElementById('langMenu');
  if (menu) menu.classList.remove('active');
};

window.toggleLangMenu = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('langMenu');
  if (menu) menu.classList.toggle('active');
};

document.addEventListener('DOMContentLoaded', () => {
  window.setLanguage(currentLang);

  // Cerrar menú de idiomas al hacer clic fuera
  document.addEventListener('click', (e) => {
    const langMenu = document.getElementById('langMenu');
    const langBtn = document.getElementById('langTriggerBtn');
    if (langMenu && langBtn && !langMenu.contains(e.target) && !langBtn.contains(e.target)) {
      langMenu.classList.remove('active');
    }
  });

  // Cerrar menú de idiomas con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const langMenu = document.getElementById('langMenu');
      if (langMenu) langMenu.classList.remove('active');
    }
  });
});

// ==========================================================================
// LÓGICA DE CALCULADORA sNPS & CSAT
// ==========================================================================
window.calculateSNPS = function() {
  const prom = Math.max(0, parseInt(document.getElementById('snpsProm')?.value) || 0);
  const pass = Math.max(0, parseInt(document.getElementById('snpsPass')?.value) || 0);
  const det = Math.max(0, parseInt(document.getElementById('snpsDet')?.value) || 0);
  const goal = Math.min(100, Math.max(-100, parseFloat(document.getElementById('snpsGoal')?.value) || 0));

  const total = prom + pass + det;
  const scoreEl = document.getElementById('resScore');
  const countEl = document.getElementById('resCount');
  const msgEl = document.getElementById('resMessage');
  if (!scoreEl) return;

  countEl.textContent = `Total: ${total.toLocaleString('en-US')} surveys`;

  if (total === 0) {
    scoreEl.textContent = '0.00';
    scoreEl.classList.remove('met');
    msgEl.innerHTML = 'Enter your survey counts above to see how many consecutive positive surveys you need.';
    return;
  }

  const currentSnps = ((prom - det) / total) * 100;
  scoreEl.textContent = currentSnps.toFixed(2);

  if (currentSnps >= goal) {
    scoreEl.classList.add('met');
    msgEl.innerHTML = `<strong class="text-success">Target achieved!</strong> Your current sNPS meets or exceeds your goal of <strong>${goal}</strong>.`;
  } else {
    scoreEl.classList.remove('met');
    if (goal >= 100) {
      msgEl.innerHTML = 'An sNPS of <strong>100</strong> requires 100% promoters with zero passives or detractors.';
      return;
    }
    const m = goal / 100;
    const needed = Math.ceil((m * total - prom + det) / (1 - m));
    msgEl.innerHTML = `You need <strong>${needed.toLocaleString('en-US')} consecutive promoter(s)</strong> to reach an sNPS of <strong>${goal}</strong>.`;
  }
};

window.resetCalculator = function() {
  ['snpsProm', 'snpsPass', 'snpsDet'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  window.calculateSNPS();
};