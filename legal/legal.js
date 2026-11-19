// ==========================================================================
// SCRIPT PARA PÁGINAS LEGALES (legal.js)
// ==========================================================================
let currentLang = localStorage.getItem('zoruvi_lang') || 'en';

window.setLanguage = function(lang) {
  currentLang = lang;
  localStorage.setItem('zoruvi_lang', lang);
  document.documentElement.setAttribute('lang', lang);

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

  document.addEventListener('click', (e) => {
    const langMenu = document.getElementById('langMenu');
    const langBtn = document.getElementById('langTriggerBtn');
    if (langMenu && langBtn && !langMenu.contains(e.target) && !langBtn.contains(e.target)) {
      langMenu.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const langMenu = document.getElementById('langMenu');
      if (langMenu) langMenu.classList.remove('active');
    }
  });
});

// ==========================================================================
// ENVÍO DE FORMULARIO DE CONTACTO (info@menosruido.store)
// ==========================================================================
window.handleContactSubmit = function(event) {
  event.preventDefault();
  const statusEl = document.getElementById('contactStatus');

  const name = document.getElementById('contactName')?.value.trim() || '';
  const email = document.getElementById('contactEmail')?.value.trim() || '';
  const reason = document.getElementById('contactReason')?.value.trim() || '';
  const message = document.getElementById('contactMessage')?.value.trim() || '';

  if (!name || !email || !reason || !message) {
    if (statusEl) statusEl.textContent = 'Please complete all required fields before sending.';
    return;
  }

  const subject = `[ZORUVI / MENOS RUIDO] ${reason} - ${name}`;
  const body = `Brand: ZORUVI (a brand by MENOS RUIDO)\nName: ${name}\nEmail: ${email}\nReason: ${reason}\n\n${message}`;

  window.location.href = `mailto:info@menosruido.store?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (statusEl) {
    statusEl.textContent = 'Opening your email client to send your message to info@menosruido.store.';
  }
};