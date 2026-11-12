// ==========================================================================
// CONFIGURACIÓN DE SUPABASE
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

// Diccionario seguro integrado
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
// 2. UTILIDAD: MOSTRAR / OCULTAR CONTRASEÑA INDEPENDIENTE (CON SVGs)
// ==========================================================================
window.togglePasswordVisibility = function(fieldId, btnElement) {
  const passwordInput = document.getElementById(fieldId);
  if (!passwordInput) return;

  const svgElement = btnElement.querySelector('svg');
  const iconColor = '#FF7043';

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    if (svgElement) {
      svgElement.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="${iconColor}"></path>
        <line x1="1" y1="1" x2="23" y2="23" stroke="${iconColor}"></line>
      `;
    }
  } else {
    passwordInput.type = 'password';
    if (svgElement) {
      svgElement.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="${iconColor}"></path>
        <circle cx="12" cy="12" r="3" stroke="${iconColor}"></circle>
      `;
    }
  }
};

// ==========================================================================
// 3. MODALES Y AUTENTICACIÓN
// ==========================================================================
window.openModal = function(mode = 'login') {
  currentMode = mode;
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
    window.switchTab(mode);
  }
};

window.closeModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

window.switchTab = function(mode) {
  currentMode = mode;
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const roleGroup = document.getElementById('roleGroup');
  const registerOnlyElements = document.querySelectorAll('.register-only');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const emailLabel = document.getElementById('emailLabel');
  const emailInput = document.getElementById('email');
  const translations = dictionaries[currentLang] || dictionaries['en'];

  // Limpiar errores visuales al cambiar de pestaña
  clearFormErrors();
  
  if (mode === 'login') {
    if (tabLogin) tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
    if (roleGroup) roleGroup.style.display = 'none';
    registerOnlyElements.forEach(el => el.style.display = 'none');
    if (emailLabel) emailLabel.innerText = translations['lbl_email_user'] || 'Email or Username';
    if (emailInput) emailInput.placeholder = translations['ph_email_user'] || 'you@zoruvi.com or username';
    if (authSubmitBtn) authSubmitBtn.innerText = translations['tab_login'] || 'Log In';
  } else {
    if (tabRegister) tabRegister.classList.add('active');
    if (tabLogin) tabLogin.classList.remove('active');
    if (roleGroup) roleGroup.style.display = 'block';
    registerOnlyElements.forEach(el => el.style.display = 'block');
    if (emailLabel) emailLabel.innerText = translations['lbl_email'] || 'Email Address';
    if (emailInput) emailInput.placeholder = 'you@zoruvi.com';
    if (authSubmitBtn) authSubmitBtn.innerText = translations['tab_register'] || 'Sign Up';
  }
};

// Función auxiliar para marcar un campo con error y descripción
function setFieldError(inputElement, message) {
  if (!inputElement) return;
  inputElement.style.borderColor = 'var(--color-fox-primary, #E0562D)';
  
  // Buscar si ya tiene un mensaje de error adyacente para no duplicarlo
  let errorDesc = inputElement.parentNode.querySelector('.field-error-msg');
  if (!errorDesc) {
    errorDesc = document.createElement('span');
    errorDesc.className = 'field-error-msg';
    errorDesc.style.color = 'var(--color-fox-primary, #E0562D)';
    errorDesc.style.fontSize = '0.75rem';
    errorDesc.style.marginTop = '0.25rem';
    errorDesc.style.display = 'block';
    inputElement.parentNode.appendChild(errorDesc);
  }
  errorDesc.innerText = message;
}

// Función auxiliar para limpiar estados de error en formularios
function clearFormErrors() {
  document.querySelectorAll('.form-input').forEach(input => {
    input.style.borderColor = '';
  });
  document.querySelectorAll('.field-error-msg').forEach(msg => msg.remove());
}

window.handleAuth = async function(event) {
  event.preventDefault();
  clearFormErrors();
  
  if (!supabaseClient) {
    alert("Supabase client not initialized.");
    return;
  }

  const translations = dictionaries[currentLang] || dictionaries['en'];
  const identifier = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (currentMode === 'login') {
    try {
      let resolvedEmail = identifier;

      if (!identifier.includes('@')) {
        const { data: fullProfile, error: fullError } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('username', identifier)
          .single();

        if (fullError || !fullProfile || !fullProfile.email) {
          setFieldError(
            document.getElementById('email'), 
            translations['err_user_not_found'] || 'User not found or missing associated email.'
          );
          throw new Error("Username not found or missing email mapping.");
        }
        resolvedEmail = fullProfile.email;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: resolvedEmail,
        password: password,
      });

      if (error) throw error;
      window.location.href = 'dashboard/dashboard.html';
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setFieldError(
          document.getElementById('password'), 
          translations['err_invalid_creds'] || 'Invalid credentials. Please check your password.'
        );
      }
    }
  } else {
    // Validaciones de Registro
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    const fullName = fullNameInput.value.trim();
    const username = usernameInput.value.trim();
    const confirmPassword = confirmPasswordInput.value;
    const role = document.getElementById('role').value;

    let hasError = false;

    // 1. Validar coincidencia de contraseñas
    if (password !== confirmPassword) {
      setFieldError(
        confirmPasswordInput, 
        translations['err_pass_mismatch'] || 'Passwords do not match.'
      );
      hasError = true;
    }

    // 2. Validar seguridad de la contraseña (8 dígitos, mayúscula, número, carácter especial)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setFieldError(
        passwordInput, 
        translations['err_pass_weak'] || 'Min 8 characters, one uppercase, one number, and one symbol.'
      );
      hasError = true;
    }

    if (hasError) return;

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: identifier,
        password: password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            role: role,
            email: identifier
          }
        }
      });

      if (error) throw error;

      // Redirección exitosa a success.html enviando el email por parámetro
      window.location.href = `success.html?email=${encodeURIComponent(identifier)}`;
      
    } catch (err) {
      let msg = err.message.toLowerCase();
      if (msg.includes('email') || msg.includes('already registered')) {
        setFieldError(
          emailInput, 
          translations['err_email_exists'] || 'This email is already registered.'
        );
      } else if (msg.includes('password')) {
        setFieldError(
          passwordInput, 
          translations['err_pass_sec'] || 'Password does not meet security requirements.'
        );
      } else {
        alert(`Registration Error: ${err.message}`);
      }
    }
  }
};

// ==========================================================================
// 4. ROTADOR DINÁMICO DE PERFILES (PREVIEW)
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

    const avatarEl = document.getElementById('previewAvatar');
    const nameEl = document.getElementById('previewName');
    const roleEl = document.getElementById('previewRole');
    const ahtEl = document.getElementById('previewAht');
    const qaEl = document.getElementById('previewQa');
    const snpsEl = document.getElementById('previewSnps');
    const adhEl = document.getElementById('previewAdh');
    const trendEl = document.getElementById('previewTrend');

    if (avatarEl) avatarEl.innerText = p.initials;
    if (nameEl) nameEl.innerText = p.name;
    if (roleEl) roleEl.innerText = p.role;
    if (ahtEl) ahtEl.innerHTML = `${p.aht} <span class="status-pill ${p.ahtStatus}"></span>`;
    if (qaEl) qaEl.innerHTML = `${p.qa} <span class="status-pill ${p.qaStatus}"></span>`;
    if (snpsEl) snpsEl.innerHTML = `${p.snps} <span class="status-pill ${p.snpsStatus}"></span>`;
    if (adhEl) adhEl.innerHTML = `${p.adh} <span class="status-pill ${p.adhStatus}"></span>`;
    if (trendEl) trendEl.innerText = p.trend;

    p.bars.forEach((height, i) => {
      const bar = document.getElementById(`bar${i + 1}`);
      if (bar) bar.style.height = height;
    });

    previewBox.classList.remove('fade-preview');
  }, 300);
}

// ==========================================================================
// 5. INICIALIZACIÓN GLOBAL
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  window.setLanguage(currentLang);
  
  document.addEventListener('click', (e) => {
    const langMenu = document.getElementById('langMenu');
    const langBtn = document.getElementById('langTriggerBtn');
    if (langMenu && langBtn && !langMenu.contains(e.target) && !langBtn.contains(e.target)) {
      langMenu.classList.remove('active');
    }
  });

  const modal = document.getElementById('authModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeModal();
    });
  }

  // Recoger el email de la URL si se encuentra en success.html
  const urlParams = new URLSearchParams(window.location.search);
  const userEmail = urlParams.get('email');
  if (userEmail) {
    const emailPlaceholder = document.getElementById('userEmailPlaceholder');
    if (emailPlaceholder) {
      emailPlaceholder.textContent = userEmail;
    }
  }

  setInterval(rotatePreviewProfile, 4500);
});