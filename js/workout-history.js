/* ===========================================
   ActiveCheck - Workout History
   Lists the trainee's workouts (date + exercise count),
   with edit and delete actions. Requires api.js, ui.js, shell.js.
   =========================================== */

const historyBody = document.getElementById('historyBody');

const EDIT_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/>' +
  '<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';

const DELETE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/>' +
  '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

function formatDate(value) {
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return dd + '/' + mm + '/' + d.getFullYear();
}

function setStateRow(message) {
  historyBody.innerHTML = '<tr><td colspan="3" class="state-row">' + message + '</td></tr>';
}

function renderWorkouts(workouts) {
  if (workouts.length === 0) {
    setStateRow('No workouts yet. Add your first workout!');
    return;
  }
  historyBody.innerHTML = '';
  workouts.forEach(function (w) {
    const tr = document.createElement('tr');

    const dateTd = document.createElement('td');
    dateTd.textContent = formatDate(w.date);

    const countTd = document.createElement('td');
    countTd.textContent = w.exercises.length;

    const actionsTd = document.createElement('td');
    const wrap = document.createElement('div');
    wrap.className = 'row-actions';

    const editBtn = document.createElement('a');
    editBtn.href = 'new-workout.html?id=' + w._id;
    editBtn.className = 'icon-btn';
    editBtn.title = 'Edit workout';
    editBtn.innerHTML = EDIT_ICON;

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'icon-btn delete';
    delBtn.title = 'Delete workout';
    delBtn.innerHTML = DELETE_ICON;
    delBtn.addEventListener('click', function () { confirmDelete(w._id); });

    wrap.appendChild(editBtn);
    wrap.appendChild(delBtn);
    actionsTd.appendChild(wrap);

    tr.appendChild(dateTd);
    tr.appendChild(countTd);
    tr.appendChild(actionsTd);
    historyBody.appendChild(tr);
  });
}

function confirmDelete(id) {
  showConfirm('Delete this workout? This cannot be undone.', {
    confirmText: 'Delete', cancelText: 'Cancel'
  }).then(function (ok) {
    if (!ok) return;
    apiFetch('/workouts/' + id, { method: 'DELETE' })
      .then(function () {
        showToast('Workout deleted', 'success');
        loadHistory();
      })
      .catch(function (err) {
        showToast(err.message, 'error');
      });
  });
}

function loadHistory() {
  setStateRow('Loading workouts...');
  apiFetch('/workouts')
    .then(function (data) { renderWorkouts(data.workouts); })
    .catch(function (err) { setStateRow('Could not load workouts. ' + err.message); });
}

loadHistory();
