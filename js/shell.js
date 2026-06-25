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
}
