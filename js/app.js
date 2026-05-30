/* ===========================================
   ActiveCheck - App shell interactions
   Mobile sidebar toggle (hamburger menu)
   =========================================== */

const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

if (hamburger && sidebar) {
  hamburger.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });
}
