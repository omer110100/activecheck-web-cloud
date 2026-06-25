/* ===========================================
   ActiveCheck - Coach Programs list
   Lists programs the coach created, with view/edit/delete.
   Requires api.js, ui.js, shell.js.
   =========================================== */

if (currentUser && currentUser.role !== 'coach') {
  window.location.href = 'dashboard.html';
}

const programsBox = document.getElementById('programsBox');

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

function viewProgram(p) {
  let html = '<p>For: ' + escapeHtml(p.traineeName || '') + '</p>';
  html += '<p>Sessions per week: ' + (p.sessionsPerWeek || 0) + '</p>';
  html += '<table><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr></thead><tbody>';
  (p.items || []).forEach(function (it) {
    html += '<tr><td>' + escapeHtml(it.exercise) + '</td><td>' + it.sets + '</td><td>' +
      it.reps + '</td><td>' + it.weight + ' kg</td></tr>';
  });
  html += '</tbody></table>';
  showInfo(p.title, html);
}

function confirmDelete(id) {
  showConfirm('Delete this program?', { confirmText: 'Delete' }).then(function (ok) {
    if (!ok) return;
    apiFetch('/programs/' + id, { method: 'DELETE' })
      .then(function () { showToast('Program deleted', 'success'); load(); })
      .catch(function (err) { showToast(err.message, 'error'); });
  });
}

function render(programs) {
  if (programs.length === 0) {
    programsBox.innerHTML = '<p class="state-msg">No programs yet. Create one below.</p>';
    return;
  }
  programsBox.innerHTML = '';
  programs.forEach(function (p) {
    const card = document.createElement('div');
    card.className = 'program-card';
    card.innerHTML =
      '<div><div class="pc-title"></div><div class="pc-sub">for ' + escapeHtml(p.traineeName || 'trainee') + '</div></div>' +
      '<div class="row-actions">' +
      '  <button class="btn btn-view btn-sm view-btn" type="button">View</button>' +
      '  <a class="btn btn-dark btn-sm" href="create-program.html?id=' + p._id + '">Edit</a>' +
      '  <button class="btn btn-reject btn-sm del-btn" type="button">Delete</button>' +
      '</div>';
    card.querySelector('.pc-title').textContent = p.title;
    card.querySelector('.view-btn').addEventListener('click', function () { viewProgram(p); });
    card.querySelector('.del-btn').addEventListener('click', function () { confirmDelete(p._id); });
    programsBox.appendChild(card);
  });
}

function load() {
  programsBox.innerHTML = '<p class="state-msg">Loading...</p>';
  apiFetch('/programs')
    .then(function (data) { render(data.programs); })
    .catch(function (err) {
      programsBox.innerHTML = '<p class="state-msg">Could not load programs. ' + err.message + '</p>';
    });
}

load();
