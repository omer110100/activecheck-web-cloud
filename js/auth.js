/* ===========================================
   ActiveCheck - Auth validation
   Handles Login + Registration form validation
   No server connection (per assignment).
   =========================================== */

/* ---------- Helper validators ---------- */

// Returns true if a string is non-empty (after trimming)
function isNotEmpty(value) {
  return value.trim().length > 0;
}

// Basic email format check
function isValidEmail(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value.trim());
}

// Password must be at least 6 characters
function isValidPassword(value) {
  return value.length >= 6;
}

/* ---------- UI helpers ---------- */

// Show an error on a field
function showError(inputEl, msgEl, message) {
  inputEl.classList.add('error');
  msgEl.textContent = message;
  msgEl.className = 'field-message error-text';
}

// Clear error from a field
function clearError(inputEl, msgEl) {
  inputEl.classList.remove('error');
  msgEl.textContent = '';
  msgEl.className = 'field-message';
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

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // no real submit
    let valid = true;
    formMsg.textContent = '';
    formMsg.className = 'field-message form-status text-center';

    // Email
    if (!isNotEmpty(email.value)) {
      showError(email, emailMsg, 'Email is required');
      valid = false;
    } else if (!isValidEmail(email.value)) {
      showError(email, emailMsg, 'Please enter a valid email');
      valid = false;
    } else {
      clearError(email, emailMsg);
    }

    // Password
    if (!isNotEmpty(password.value)) {
      showError(password, passwordMsg, 'Password is required');
      valid = false;
    } else if (!isValidPassword(password.value)) {
      showError(password, passwordMsg, 'Password must be at least 6 characters');
      valid = false;
    } else {
      clearError(password, passwordMsg);
    }

    // Success
    if (valid) {
      formMsg.textContent = 'Login successful! Redirecting...';
      formMsg.className = 'field-message form-status text-center success-text';
      // simulate redirect to dashboard
      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 1200);
    }
  });
}

/* ===========================================
   REGISTRATION FORM
   (wired up when we build register.html)
   =========================================== */
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  const rEmail = document.getElementById('rEmail');
  const rPassword = document.getElementById('rPassword');
  const rConfirm = document.getElementById('rConfirm');
  const rRole = document.getElementById('rRole');

  const rEmailMsg = document.getElementById('rEmailMsg');
  const rPasswordMsg = document.getElementById('rPasswordMsg');
  const rConfirmMsg = document.getElementById('rConfirmMsg');
  const rRoleMsg = document.getElementById('rRoleMsg');
  const rFormMsg = document.getElementById('rFormMsg');

  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;
    rFormMsg.textContent = '';
    rFormMsg.className = 'field-message form-status text-center';

    // Email
    if (!isNotEmpty(rEmail.value)) {
      showError(rEmail, rEmailMsg, 'Email is required');
      valid = false;
    } else if (!isValidEmail(rEmail.value)) {
      showError(rEmail, rEmailMsg, 'Please enter a valid email');
      valid = false;
    } else {
      clearError(rEmail, rEmailMsg);
    }

    // Password
    if (!isValidPassword(rPassword.value)) {
      showError(rPassword, rPasswordMsg, 'Password must be at least 6 characters');
      valid = false;
    } else {
      clearError(rPassword, rPasswordMsg);
    }

    // Confirm password
    if (!isNotEmpty(rConfirm.value)) {
      showError(rConfirm, rConfirmMsg, 'Please confirm your password');
      valid = false;
    } else if (rConfirm.value !== rPassword.value) {
      showError(rConfirm, rConfirmMsg, 'Passwords do not match');
      valid = false;
    } else {
      clearError(rConfirm, rConfirmMsg);
    }

    // Role dropdown
    if (!isNotEmpty(rRole.value)) {
      showError(rRole, rRoleMsg, 'Please select a role');
      valid = false;
    } else {
      clearError(rRole, rRoleMsg);
    }

    // Success
    if (valid) {
      rFormMsg.textContent = 'Registration successful! Redirecting...';
      rFormMsg.className = 'field-message form-status text-center success-text';
      registerForm.reset();
      // mirror the login flow: send the user into the main app
      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 1200);
    }
  });
}
