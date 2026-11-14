// ==========================================================================
// MÓDULO AUTOCONTENIDO DE REGISTRO (register/register.js)
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

const dictionaries = {
  en: window.i18n_en || { tab_login: "Log In", tab_register: "Create Account" },
  es: window.i18n_es || { tab_login: "Iniciar Sesión", tab_register: "Crear Cuenta" },
  pt: window.i18n_pt || { tab_login: "Entrar", tab_register: "Criar Conta" },
  fr: window.i18n_fr || { tab_login: "Connexion", tab_register: "Créer un compte" },
  hi: window.i18n_hi || { tab_login: "लॉग इन", tab_register: "खाता बनाएं" },
  pa: window.i18n_pa || { tab_login: "ਲਾਗ ਇਨ", tab_register: "ਖਾਤਾ ਬਣਾਓ" }
};

// Lista completa de países reconocidos (Anticonejolandias)
const countryList = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

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
// 2. VISIBILIDAD DE CONTRASEÑA
// ==========================================================================
window.togglePasswordVisibility = function(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const useElement = btn.querySelector('use');
  if (!useElement) return;

  if (input.type === 'password') {
    input.type = 'text';
    useElement.setAttribute('href', '#icon-eye-off');
  } else {
    input.type = 'password';
    useElement.setAttribute('href', '#icon-eye');
  }
};

// ==========================================================================
// 3. AUTOCOMPLETADO Y VALIDACIÓN DE PAÍSES (Anticonejolandias)
// ==========================================================================
function setupCountryAutocomplete() {
  const input = document.getElementById('regCountry');
  const container = document.getElementById('countryOptionsContainer');
  if (!input || !container) return;

  function renderOptions(filterText = '') {
    container.innerHTML = '';
    const filtered = countryList.filter(c => c.toLowerCase().includes(filterText.toLowerCase()));

    if (filtered.length === 0) {
      container.classList.remove('active');
      return;
    }

    filtered.forEach(country => {
      const option = document.createElement('div');
      option.className = 'custom-option';
      option.innerText = country;
      option.addEventListener('click', () => {
        input.value = country;
        container.classList.remove('active');
        input.style.borderColor = '';
      });
      container.appendChild(option);
    });

    container.classList.add('active');
  }

  input.addEventListener('focus', () => renderOptions(input.value));
  input.addEventListener('input', () => renderOptions(input.value));

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !container.contains(e.target)) {
      container.classList.remove('active');
    }
  });
}

// ==========================================================================
// 4. VALIDACIONES DE CONTRASEÑA EN TIEMPO REAL
// ==========================================================================
function setupPasswordValidation() {
  const passwordInput = document.getElementById('regPassword');
  const confirmInput = document.getElementById('regConfirmPassword');
  const requirementsBox = document.getElementById('passwordRequirements');
  const mismatchMsg = document.getElementById('passwordMismatchMsg');

  if (!passwordInput || !requirementsBox) return;

  // Mostrar cajita al hacer foco o escribir
  passwordInput.value = '';
  passwordInput.addEventListener('focus', () => {
    requirementsBox.classList.add('active');
  });

  // Ocultar cajita si hace clic fuera del input y de la cajita
  document.addEventListener('click', (e) => {
    if (!passwordInput.contains(e.target) && !requirementsBox.contains(e.target)) {
      requirementsBox.classList.remove('active');
    }
  });

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    requirementsBox.classList.add('active');

    // Validar condiciones
    const hasLength = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(val);

    document.getElementById('req-length').classList.toggle('valid', hasLength);
    document.getElementById('req-upper').classList.toggle('valid', hasUpper);
    document.getElementById('req-number').classList.toggle('valid', hasNumber);
    document.getElementById('req-special').classList.toggle('valid', hasSpecial);

    // Validar match en tiempo real si el confirm ya tiene texto
    if (confirmInput && confirmInput.value.length > 0) {
      if (val !== confirmInput.value) {
        mismatchMsg.classList.add('active');
      } else {
        mismatchMsg.classList.remove('active');
      }
    }
  });

  if (confirmInput) {
    confirmInput.addEventListener('input', () => {
      if (confirmInput.value !== passwordInput.value) {
        mismatchMsg.classList.add('active');
      } else {
        mismatchMsg.classList.remove('active');
      }
    });
  }
}

function setRegFieldError(inputElement, message) {
  if (!inputElement) return;
  inputElement.style.borderColor = 'var(--color-fox-primary)';
  
  let errorDesc = inputElement.parentNode.querySelector('.field-error-msg');
  if (!errorDesc) {
    errorDesc = document.createElement('span');
    errorDesc.className = 'field-error-msg';
    errorDesc.style.color = 'var(--color-fox-primary)';
    errorDesc.style.fontSize = '0.75rem';
    errorDesc.style.marginTop = '0.25rem';
    errorDesc.style.display = 'block';
    inputElement.parentNode.appendChild(errorDesc);
  }
  errorDesc.innerText = message;
}

function clearRegFormErrors() {
  document.querySelectorAll('.form-input').forEach(input => {
    input.style.borderColor = '';
  });
  document.querySelectorAll('.field-error-msg').forEach(msg => msg.remove());
}

// ==========================================================================
// 5. ENVÍO DE REGISTRO A SUPABASE
// ==========================================================================
window.handleRegister = async function(event) {
  event.preventDefault();
  clearRegFormErrors();

  if (!supabaseClient) {
    alert("Supabase client not initialized.");
    return;
  }

  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const countryInput = document.getElementById('regCountry').value.trim();
  const submitBtn = document.getElementById('registerSubmitBtn');

  // Validar país permitido (Anticonejolandias)
  if (!countryList.includes(countryInput)) {
    setRegFieldError(document.getElementById('regCountry'), "Please select a valid country from the list.");
    return;
  }

  // Validar robustez estricta de contraseña
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasLength || !hasUpper || !hasNumber || !hasSpecial) {
    setRegFieldError(document.getElementById('regPassword'), "Password does not meet all security requirements.");
    return;
  }

  if (password !== confirmPassword) {
    setRegFieldError(document.getElementById('regConfirmPassword'), "Passwords do not match.");
    document.getElementById('passwordMismatchMsg').classList.add('active');
    return;
  }

  const originalText = submitBtn.innerText;
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.7';
  submitBtn.innerText = '...';

  try {
    // 1. Verificar disponibilidad de username
    const { data: existingUser } = await supabaseClient
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      setRegFieldError(document.getElementById('regUsername'), "This username is already taken.");
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.innerText = originalText;
      return;
    }

    // 2. Crear cuenta en Supabase Auth guardando el país en los metadata
    const { error: authError } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          country: countryInput
        }
      }
    });

    if (authError) {
      setRegFieldError(document.getElementById('regEmail'), authError.message);
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.innerText = originalText;
      return;
    }

    // Redirigir a success.html en la raíz
    window.location.href = `success.html?email=${encodeURIComponent(email)}`;

  } catch (err) {
    console.error("Error en el registro:", err);
    setRegFieldError(document.getElementById('regEmail'), "An unexpected error occurred during registration.");
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.innerText = originalText;
  }
};

// ==========================================================================
// 6. INICIALIZACIÓN DE LA VISTA
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  window.setLanguage(currentLang);
  setupCountryAutocomplete();
  setupPasswordValidation();

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