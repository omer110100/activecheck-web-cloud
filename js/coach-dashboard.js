/* ===========================================
   ActiveCheck - Coach Dashboard
   Pending assignment requests (approve/reject) +
   active trainees (view profile).
   Requires api.js, ui.js, shell.js.
   =========================================== */

if (currentUser && currentUser.role !== 'coach') {
  window.location.href = 'dashboard.html';
}

const pendingList = document.getElementById('pendingList');
const traineesList = document.getElementById('traineesList');

function initial(name) {
  return (name || '?').charAt(0).toUpperCase();
}

function shortDate(value) {
  if (!value) return '—';
  return new Date(value).toISOString().slice(0, 10);
}

function renderPending(requests) {
  if (requests.length === 0) {
    pendingList.innerHTML = '<p class="state-msg">No pending requests.</p>';
    return;
  }
  pendingList.innerHTML = '';
  requests.forEach(function (r) {
    const name = r.trainee ? r.trainee.name : 'Unknown';
    const row = document.createElement('div');
    row.className = 'data-row';
    row.innerHTML =
      '<span class="row-avatar">' + initial(name) + '</span>' +
      '<span class="row-name"></span>' +
      '<span class="row-meta">' + shortDate(r.requestedAt) + '</span>' +
      '<div class="row-actions">' +
      '  <button class="btn btn-reject btn-sm" type="button">Reject</button>' +
      '  <button class="btn btn-approve btn-sm" type="button">Approve</button>' +
      '</div>';
    row.querySelector('.row-name').textContent = name;
    const buttons = row.querySelectorAll('button');
    buttons[0].addEventListener('click', function () { decide(r._id, 'rejected'); });
    buttons[1].addEventListener('click', function () { decide(r._id, 'approved'); });
    pendingList.appendChild(row);
  });
}

function renderTrainees(trainees) {
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
      '</div>';
    row.querySelector('.row-name').textContent = t.name;
    traineesList.appendChild(row);
  });
}

function decide(id, status) {
  apiFetch('/requests/' + id, { method: 'PUT', body: JSON.stringify({ status: status }) })
    .then(function () {
      showToast(status === 'approved' ? 'Request approved' : 'Request rejected', 'success');
      loadAll();
    })
    .catch(function (err) { showToast(err.message, 'error'); });
}

function loadAll() {
  pendingList.innerHTML = '<p class="state-msg">Loading...</p>';
  traineesList.innerHTML = '<p class="state-msg">Loading...</p>';
  apiFetch('/requests/pending')
    .then(function (data) { renderPending(data.requests); })
    .catch(function (err) { pendingList.innerHTML = '<p class="state-msg">' + err.message + '</p>'; });
  apiFetch('/requests/my-trainees')
    .then(function (data) { renderTrainees(data.trainees); })
    .catch(function (err) { traineesList.innerHTML = '<p class="state-msg">' + err.message + '</p>'; });
}

loadAll();
