/* ===========================================
   ActiveCheck - Create / Edit Program (coach)
   Coach builds a program for one of their trainees.
   Modes: ?traineeId= (new for trainee) | ?id= (edit) | none (pick trainee).
   Requires api.js, ui.js, exercises.js, shell.js.
   =========================================== */

if (currentUser && currentUser.role !== 'coach') {
  window.location.href = 'dashboard.html';
}

const DELETE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/>' +
  '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

const params = new URLSearchParams(window.location.search);
const fixedTraineeId = params.get('traineeId');
const programId = params.get('id');

const traineeSelect = document.getElementById('traineeSelect');
const nameInput = document.getElementById('programName');
const sessionsInput = document.getElementById('sessionsWeek');
const rowsContainer = document.getElementById('exerciseRows');
const addBtn = document.getElementById('addExerciseBtn');
const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('formStatus');
const pageTitle = document.getElementById('pageTitle');

let exerciseNames = FALLBACK_EXERCISES.slice();

function setStatus(message, type) {
  statusEl.textContent = message || '';
  statusEl.className = 'field-message form-status text-center' + (type ? ' ' + type + '-text' : '');
}

function addRow(values) {
  values = values || {};
  const row = document.createElement('div');
  row.className = 'exercise-row';

  const select = document.createElement('select');
  select.className = 'ex-name';
  select.innerHTML = buildExerciseOptions(exerciseNames, values.exercise);

  const sets = document.createElement('input');
  sets.type = 'number'; sets.min = '0'; sets.className = 'ex-sets';
  sets.value = values.sets != null ? values.sets : ''; sets.placeholder = 'Sets';

  const reps = document.createElement('input');
  reps.type = 'number'; reps.min = '0'; reps.className = 'ex-reps';
  reps.value = values.reps != null ? values.reps : ''; reps.placeholder = 'Reps';

  const weight = document.createElement('input');
  weight.type = 'number'; weight.min = '0'; weight.className = 'ex-weight';
  weight.value = values.weight != null ? values.weight : ''; weight.placeholder = 'Kg';

  const del = document.createElement('button');
  del.type = 'button'; del.className = 'row-delete'; del.title = 'Remove exercise';
  del.innerHTML = DELETE_ICON;
  del.addEventListener('click', function () { row.remove(); });

  row.appendChild(select); row.appendChild(sets); row.appendChild(reps);
  row.appendChild(weight); row.appendChild(del);
  rowsContainer.appendChild(row);
}

function collectItems() {
  const items = [];
  rowsContainer.querySelectorAll('.exercise-row').forEach(function (row) {
    const exercise = row.querySelector('.ex-name').value;
    if (!exercise) return;
    items.push({
      exercise: exercise,
      sets: Number(row.querySelector('.ex-sets').value) || 0,
      reps: Number(row.querySelector('.ex-reps').value) || 0,
      weight: Number(row.querySelector('.ex-weight').value) || 0
    });
  });
  return items;
}

function save() {
  setStatus('');
  const traineeId = traineeSelect.value;
  if (!traineeId) { setStatus('Please choose a trainee', 'error'); return; }
  const title = nameInput.value.trim();
  if (!title) { setStatus('Please enter a program name', 'error'); return; }
  const items = collectItems();
  if (items.length === 0) { setStatus('Add at least one exercise', 'error'); return; }

  const payload = {
    traineeId: traineeId,
    title: title,
    sessionsPerWeek: Number(sessionsInput.value) || 0,
    items: items
  };

  saveBtn.disabled = true;
  setStatus('Saving...');

  const request = programId
    ? apiFetch('/programs/' + programId, { method: 'PUT', body: JSON.stringify(payload) })
    : apiFetch('/programs', { method: 'POST', body: JSON.stringify(payload) });

  request.then(function () {
    showToast('Program saved', 'success');
    setTimeout(function () {
      window.location.href = fixedTraineeId
        ? 'trainee-profile.html?id=' + traineeId
        : 'coach-programs.html';
    }, 600);
  }).catch(function (err) {
    saveBtn.disabled = false;
    setStatus(err.message, 'error');
  });
}

function populateTrainees(trainees, selectedId) {
  traineeSelect.innerHTML = '<option value="">Select trainee</option>';
  trainees.forEach(function (t) {
    const opt = document.createElement('option');
    opt.value = t._id;
    opt.textContent = t.name;
    if (selectedId && String(selectedId) === String(t._id)) opt.selected = true;
    traineeSelect.appendChild(opt);
  });
}

function loadForEdit() {
  // no GET /programs/:id endpoint — fetch the coach's programs and find it
  return apiFetch('/programs').then(function (data) {
    const program = (data.programs || []).find(function (p) { return p._id === programId; });
    if (!program) { setStatus('Program not found', 'error'); return; }
    pageTitle.textContent = 'Edit Program';
    nameInput.value = program.title || '';
    sessionsInput.value = program.sessionsPerWeek || 0;
    traineeSelect.value = program.traineeId;
    traineeSelect.disabled = true;
    rowsContainer.innerHTML = '';
    if (program.items && program.items.length) {
      program.items.forEach(function (it) { addRow(it); });
    } else {
      addRow();
    }
  });
}

function init() {
  addBtn.addEventListener('click', function () { addRow(); });
  saveBtn.addEventListener('click', save);

  Promise.all([loadExerciseNames(), apiFetch('/requests/my-trainees')])
    .then(function (results) {
      exerciseNames = results[0];
      populateTrainees(results[1].trainees, fixedTraineeId);

      if (programId) {
        loadForEdit();
      } else {
        if (fixedTraineeId) traineeSelect.disabled = true;
        addRow();
      }
    })
    .catch(function (err) { setStatus('Could not load. ' + err.message, 'error'); });
}

init();
