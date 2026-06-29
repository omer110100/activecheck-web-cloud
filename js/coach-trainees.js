/* ===========================================
   ActiveCheck - Coach Trainees list
   Requires api.js, ui.js, shell.js.
   =========================================== */

if (currentUser && currentUser.role !== 'coach') {
  window.location.href = 'dashboard.html';
}

const traineesList = document.getElementById('traineesList');

function initial(name) {
  return (name || '?').charAt(0).toUpperCase();
}

function shortDate(value) {
  if (!value) return '—';
  return new Date(value).toISOString().slice(0, 10);
}

function render(trainees) {
  if (trainees.length === 0) {
    traineesList.innerHTML = '<p class="state-msg">No active trainees yet.</p>';
    return;
  }
  traineesList.innerHTML = '';
  trainees.forEach(function (t) {
    const row = document.createElement('div');
    row.className = 'data-row';
    row.innerHTML =
      '<span class="row-avatar">' + initial(t.name) + '</span>' +
      '<span class="row-name"></span>' +
      '<span class="row-meta">Last: ' + shortDate(t.lastWorkout) + '</span>' +
      '<div class="row-actions">' +
      '  <a class="btn btn-view btn-sm" href="trainee-profile.html?id=' + t._id + '">View Profile</a>' +
      '  <button class="btn btn-reject btn-sm remove-btn" type="button">Remove</button>' +
      '</div>';
    row.querySelector('.row-name').textContent = t.name;
    row.querySelector('.remove-btn').addEventListener('click', function () { confirmRemove(t._id, t.name); });
    traineesList.appendChild(row);
  });
}

function confirmRemove(id, name) {
  showConfirm('Remove ' + name + ' from your trainees?', { confirmText: 'Remove' }).then(function (ok) {
    if (!ok) return;
    apiFetch('/requests/trainee/' + id, { method: 'DELETE' })
      .then(function () { showToast('Trainee removed', 'success'); load(); })
      .catch(function (err) { showToast(err.message, 'error'); });
  });
}

function load() {
  apiFetch('/requests/my-trainees')
    .then(function (data) { render(data.trainees); })
    .catch(function (err) {
      traineesList.innerHTML = '<p class="state-msg">Could not load trainees. ' + err.message + '</p>';
    });
}

load();
