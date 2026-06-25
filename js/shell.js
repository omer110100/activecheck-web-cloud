/* ===========================================
   ActiveCheck - Logged-in shell helper
   Guards the page (redirects if not logged in)
   and fills the top-bar greeting. Requires api.js.
   =========================================== */

const currentUser = requireLogin();

if (currentUser) {
  const initialEl = document.getElementById('userInitial');
  const greetEl = document.getElementById('userGreeting');
  if (initialEl) {
    initialEl.textContent = (currentUser.name || '?').charAt(0).toUpperCase();
  }
  if (greetEl) {
    greetEl.textContent = 'Hello ' + (currentUser.name || '') + ' !';
  }

  // Inject a shared logout button into the top-bar greeting
  const greetingBox = document.querySelector('.user-greeting');
  if (greetingBox && !document.getElementById('logoutBtn')) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.type = 'button';
    logoutBtn.className = 'logout-btn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.addEventListener('click', function () {
      function finish() {
        clearToken();
        window.location.href = 'index.html';
      }
      apiFetch('/users/logout', { method: 'POST' }).then(finish).catch(finish);
    });
    greetingBox.appendChild(logoutBtn);
  }
}
