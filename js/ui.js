/* ===========================================
   ActiveCheck - Shared UI helpers
   In-page confirm modal + toast messages
   (replaces the forbidden alert / confirm / prompt).
   =========================================== */

function showConfirm(message, opts) {
  opts = opts || {};
  return new Promise(function (resolve) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
      '  <p class="modal-message"></p>' +
      '  <div class="modal-actions">' +
      '    <button class="btn btn-dark modal-cancel" type="button"></button>' +
      '    <button class="btn btn-primary modal-confirm" type="button"></button>' +
      '  </div>' +
      '</div>';

    overlay.querySelector('.modal-message').textContent = message;
    overlay.querySelector('.modal-cancel').textContent = opts.cancelText || 'Cancel';
    overlay.querySelector('.modal-confirm').textContent = opts.confirmText || 'Confirm';
    document.body.appendChild(overlay);

    function close(result) {
      overlay.remove();
      resolve(result);
    }
    overlay.querySelector('.modal-cancel').addEventListener('click', function () { close(false); });
    overlay.querySelector('.modal-confirm').addEventListener('click', function () { close(true); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close(false);
    });
  });
}

function showInfo(title, bodyHtml) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true">' +
    '  <h3 class="modal-title"></h3>' +
    '  <div class="modal-body"></div>' +
    '  <div class="modal-actions">' +
    '    <button class="btn btn-primary modal-close" type="button">Close</button>' +
    '  </div>' +
    '</div>';
  overlay.querySelector('.modal-title').textContent = title;
  overlay.querySelector('.modal-body').innerHTML = bodyHtml;
  document.body.appendChild(overlay);

  function close() { overlay.remove(); }
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
}

function showToast(message, type) {
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-host';
    document.body.appendChild(host);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = message;
  host.appendChild(toast);
  setTimeout(function () { toast.classList.add('toast-hide'); }, 2500);
  setTimeout(function () { toast.remove(); }, 3000);
}
