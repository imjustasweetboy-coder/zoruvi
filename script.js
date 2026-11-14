// ==========================================================================
// CONFIGURACIÓN DE SUPABASE Y ESTADO GLOBAL
// ==========================================================================
const SUPABASE_URL = 'https://odrcgxwgbltinaudplao.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_omwz5S3thHuN2-fzry4QSg_3d0KcpIS';
let supabaseClient = null;

try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.error("Error al inicializar Supabase:", e);
}

let currentLang = localStorage.getItem('zoruvi_lang') || 'en';
let currentMode = 'login';

const dictionaries = {
  en: window.i18n_en || { tab_login: "Log In", tab_register: "Sign Up" },
  es: window.i18n_es || { tab_login: "Iniciar Sesión", tab_register: "Registrarse" },
  pt: window.i18n_pt || { tab_login: "Entrar", tab_register: "Cadastrar" },
  fr: window.i18n_fr || { tab_login: "Connexion", tab_register: "S'inscrire" },
  hi: window.i18n_hi || { tab_login: "लॉग इन", tab_register: "साइन अप" },
  pa: window.i18n_pa || { tab_login: "ਲਾਗ ਇਨ", tab_register: "ਸਾਈਨ ਅੱਪ" }
};

// ==========================================================================
// 1. GESTIÓN DE IDIOMAS
// ==========================================================================
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

// ==========================================================================
// 2. ROTADOR DINÁMICO DE PERFILES (LIVE PREVIEW)
// ==========================================================================
const mockProfiles = [
  {
    name: "Marcus Gillespie", initials: "MG", role: "Operations Agent",
    aht: "342s", ahtStatus: "good", qa: "98.5%", qaStatus: "good",
    snps: "+72", snpsStatus: "good", adh: "91.0%", adhStatus: "warn",
    trend: "+4.2% vs target", bars: ["85%", "95%", "70%", "90%", "88%", "96%"]
  },
  {
    name: "Sophia Vance", initials: "SV", role: "Senior Support Specialist",
    aht: "298s", ahtStatus: "good", qa: "99.1%", qaStatus: "good",
    snps: "+85", snpsStatus: "good", adh: "95.5%", adhStatus: "good",
    trend: "+6.8% vs target", bars: ["90%", "88%", "95%", "92%", "94%", "98%"]
  },
  {
    name: "Liam O'Connor", initials: "LO", role: "Technical Squad Lead",
    aht: "315s", ahtStatus: "good", qa: "94.2%", qaStatus: "warn",
    snps: "+64", snpsStatus: "good", adh: "88.0%", adhStatus: "warn",
    trend: "+2.1% vs target", bars: ["75%", "82%", "88%", "80%", "85%", "90%"]
  },
  {
    name: "Valeria Mendez", initials: "VM", role: "Quality Assurance Agent",
    aht: "330s", ahtStatus: "good", qa: "99.8%", qaStatus: "good",
    snps: "+79", snpsStatus: "good", adh: "96.2%", adhStatus: "good",
    trend: "+7.5% vs target", bars: ["95%", "96%", "91%", "97%", "93%", "99%"]
  }
];

let currentProfileIndex = 0;

function rotatePreviewProfile() {
  const previewBox = document.querySelector('.hero-preview');
  if (!previewBox) return;

  previewBox.classList.add('fade-preview');

  setTimeout(() => {
    currentProfileIndex = (currentProfileIndex + 1) % mockProfiles.length;
    const p = mockProfiles[currentProfileIndex];

    const elements = {
      previewAvatar: p.initials,
      previewName: p.name,
      previewRole: p.role,
      previewTrend: p.trend
    };

    Object.entries(elements).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    });

    const metrics = {
      previewAht: `${p.aht} <span class="status-pill ${p.ahtStatus}"></span>`,
      previewQa: `${p.qa} <span class="status-pill ${p.qaStatus}"></span>`,
      previewSnps: `${p.snps} <span class="status-pill ${p.snpsStatus}"></span>`,
      previewAdh: `${p.adh} <span class="status-pill ${p.adhStatus}"></span>`
    };

    Object.entries(metrics).forEach(([id, html]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });

    p.bars.forEach((height, i) => {
      const bar = document.getElementById(`bar${i + 1}`);
      if (bar) bar.style.height = height;
    });

    previewBox.classList.remove('fade-preview');
  }, 220);
}

// ==========================================================================
// 3. INICIALIZACIÓN GLOBAL
// ==========================================================================
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

  // Cerrar modal al hacer clic en el fondo oscuro
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal && typeof window.closeModal === 'function') {
        window.closeModal();
      }
    });
  }

  // Soporte de teclado: cerrar menús y modales con la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const langMenu = document.getElementById('langMenu');
      if (langMenu) langMenu.classList.remove('active');
      
      if (modal && modal.classList.contains('active') && typeof window.closeModal === 'function') {
        window.closeModal();
      }
    }
  });

  // Mostrar email dinámicamente en success.html
  const urlParams = new URLSearchParams(window.location.search);
  const userEmail = urlParams.get('email');
  if (userEmail) {
    const emailPlaceholder = document.getElementById('userEmailPlaceholder');
    if (emailPlaceholder) {
      emailPlaceholder.textContent = userEmail;
    }
  }

  // Iniciar rotación de perfiles solo si existe la vista previa en la página actual
  if (document.querySelector('.hero-preview')) {
    setInterval(rotatePreviewProfile, 4500);
  }
});