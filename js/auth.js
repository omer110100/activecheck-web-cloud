/* ===========================================
   ActiveCheck - Auth
   Login + Registration: client validation, then
   real API calls (js/api.js must load first).
   =========================================== */

/* ---------- Helper validators ---------- */
function isNotEmpty(value) {
  return value.trim().length > 0;
}

function isValidEmail(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value.trim());
}

function isValidPassword(value) {
  return value.length >= 6;
}

/* ---------- UI helpers ---------- */
function showError(inputEl, msgEl, message) {
  inputEl.classList.add('error');
  msgEl.textContent = message;
  msgEl.className = 'field-message error-text';
}

function clearError(inputEl, msgEl) {
  inputEl.classList.remove('error');
  msgEl.textContent = '';
  msgEl.className = 'field-message';
}

function redirectByRole(role) {
  window.location.href = role === 'coach' ? 'coach-dashboard.html' : 'dashboard.html';
}

/* ===========================================
   LOGIN FORM
   =========================================== */
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailMsg = document.getElementById('emailMsg');
  const passwordMsg = document.getElementById('passwordMsg');
  const formMsg = document.getElementById('formMsg');
  const submitBtn = loginForm.querySelector('button[type="submit"]');

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;
    formMsg.textContent = '';
    formMsg.className = 'field-message form-status text-center';

    if (!isNotEmpty(email.value)) {
      showError(email, emailMsg, 'Email is required');
      valid = false;
    } else if (!isValidEmail(email.value)) {
      showError(email, emailMsg, 'Please enter a valid email');
      valid = false;
    } else {
      clearError(email, emailMsg);
    }

    if (!isNotEmpty(password.value)) {
      showError(password, passwordMsg, 'Password is required');
      valid = false;
    } else if (!isValidPassword(password.value)) {
      showError(password, passwordMsg, 'Password must be at least 6 characters');
      valid = false;
    } else {
      clearError(password, passwordMsg);
    }

    if (!valid) return;

    submitBtn.disabled = true;
    formMsg.textContent = 'Logging in...';
    formMsg.className = 'field-message form-status text-center';

    apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value.trim(), password: password.value })
    }).then(function (data) {
      setToken(data.token);
      setUser(data.user);
      formMsg.textContent = 'Login successful! Redirecting...';
      formMsg.className = 'field-message form-status text-center success-text';
      setTimeout(function () { redirectByRole(data.user.role); }, 700);
    }).catch(function (err) {
      submitBtn.disabled = false;
      formMsg.textContent = err.message;
      formMsg.className = 'field-message form-status text-center error-text';
    });
  });
}

/* ===========================================
   REGISTRATION FORM
   =========================================== */
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  const rName = document.getElementById('rName');
  const rEmail = document.getElementById('rEmail');
  const rPassword = document.getElementById('rPassword');
  const rConfirm = document.getElementById('rConfirm');
  const rRole = document.getElementById('rRole');

  const rNameMsg = document.getElementById('rNameMsg');
  const rEmailMsg = document.getElementById('rEmailMsg');
  const rPasswordMsg = document.getElementById('rPasswordMsg');
  const rConfirmMsg = document.getElementById('rConfirmMsg');
  const rRoleMsg = document.getElementById('rRoleMsg');
  const rFormMsg = document.getElementById('rFormMsg');
  const submitBtn = registerForm.querySelector('button[type="submit"]');

  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;
    rFormMsg.textContent = '';
    rFormMsg.className = 'field-message form-status text-center';

    if (!isNotEmpty(rName.value)) {
      showError(rName, rNameMsg, 'Name is required');
      valid = false;
    } else {
      clearError(rName, rNameMsg);
    }

    if (!isNotEmpty(rEmail.value)) {
      showError(rEmail, rEmailMsg, 'Email is required');
      valid = false;
    } else if (!isValidEmail(rEmail.value)) {
      showError(rEmail, rEmailMsg, 'Please enter a valid email');
      valid = false;
    } else {
      clearError(rEmail, rEmailMsg);
    }

    if (!isValidPassword(rPassword.value)) {
      showError(rPassword, rPasswordMsg, 'Password must be at least 6 characters');
      valid = false;
    } else {
      clearError(rPassword, rPasswordMsg);
    }

    if (!isNotEmpty(rConfirm.value)) {
      showError(rConfirm, rConfirmMsg, 'Please confirm your password');
      valid = false;
    } else if (rConfirm.value !== rPassword.value) {
      showError(rConfirm, rConfirmMsg, 'Passwords do not match');
      valid = false;
    } else {
      clearError(rConfirm, rConfirmMsg);
    }

    if (!isNotEmpty(rRole.value)) {
      showError(rRole, rRoleMsg, 'Please select a role');
      valid = false;
    } else {
      clearError(rRole, rRoleMsg);
    }

    if (!valid) return;

    submitBtn.disabled = true;
    rFormMsg.textContent = 'Creating your account...';
    rFormMsg.className = 'field-message form-status text-center';

    apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify({
        name: rName.value.trim(),
        email: rEmail.value.trim(),
        password: rPassword.value,
        role: rRole.value
      })
    }).then(function (data) {
      setToken(data.token);
      setUser(data.user);
      rFormMsg.textContent = 'Registration successful! Redirecting...';
      rFormMsg.className = 'field-message form-status text-center success-text';
      setTimeout(function () { redirectByRole(data.user.role); }, 700);
    }).catch(function (err) {
      submitBtn.disabled = false;
      rFormMsg.textContent = err.message;
      rFormMsg.className = 'field-message form-status text-center error-text';
    });
  });
}
