// ==========================================================================
// MÓDULO DE AUTENTICACIÓN OPTIMIZADO (auth.js - Ultra rápido y fluido)
// ==========================================================================

window.openModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }
};

window.closeModal = function() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
};

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

function setFieldError(inputElement, message) {
  if (!inputElement) return;
  inputElement.style.borderColor = 'var(--color-fox-primary, #E0562D)';
  
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
  const authSubmitBtn = document.getElementById('authSubmitBtn');

  const originalBtnText = authSubmitBtn.innerText;
  authSubmitBtn.disabled = true;
  authSubmitBtn.style.opacity = '0.7';
  authSubmitBtn.innerText = '...';

  try {
    let resolvedEmail = identifier;

    // Optimización extrema: Consulta rápida limitada a 1 registro con índice optimizado
    if (!identifier.includes('@')) {
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .limit(1)
        .maybeSingle();

      if (profileError || !profileData || !profileData.email) {
        setFieldError(
          document.getElementById('email'), 
          translations['err_user_not_found'] || 'No hay coincidencias con este usuario o no existe.'
        );
        authSubmitBtn.disabled = false;
        authSubmitBtn.style.opacity = '1';
        authSubmitBtn.innerText = originalBtnText;
        return;
      }
      resolvedEmail = profileData.email;
    }

    // Autenticación directa y fluida con Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: resolvedEmail,
      password: password,
    });

    if (error) {
      setFieldError(
        document.getElementById('password'), 
        translations['err_invalid_creds'] || 'No hay coincidencias o la contraseña es incorrecta.'
      );
      authSubmitBtn.disabled = false;
      authSubmitBtn.style.opacity = '1';
      authSubmitBtn.innerText = originalBtnText;
      return;
    }

    // Cierre inmediato del modal y redirección instantánea
    document.body.classList.remove('modal-open');
    window.location.replace('dashboard/dashboard.html');
  } catch (err) {
    console.error("Error en el login:", err);
    setFieldError(
      document.getElementById('email'), 
      translations['err_general_login'] || 'Ocurrió un error al iniciar sesión. Verifica tus datos.'
    );
    authSubmitBtn.disabled = false;
    authSubmitBtn.style.opacity = '1';
    authSubmitBtn.innerText = originalBtnText;
  }
};