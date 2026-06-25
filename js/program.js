/* ===========================================
   ActiveCheck - Trainee Program
   The trainee builds/edits their own training program.
   Loads an existing program (edit) or starts a new one.
   Requires api.js, ui.js, exercises.js, shell.js.
   =========================================== */

const DELETE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/>' +
  '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

const nameInput = document.getElementById('programName');
const sessionsInput = document.getElementById('sessionsWeek');
const rowsContainer = document.getElementById('exerciseRows');
const addBtn = document.getElementById('addExerciseBtn');
const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('formStatus');
const pageTitle = document.getElementById('pageTitle');

let exerciseNames = FALLBACK_EXERCISES.slice();
let currentProgramId = null;

function setStatus(message, type) {
  statusEl.textContent = message || '';
  statusEl.className = 'field-message form-status text-center' +
    (type ? ' ' + type + '-text' : '');
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
  sets.value = values.sets != null ? values.sets : '';
  sets.placeholder = 'Sets';

  const reps = document.createElement('input');
  reps.type = 'number'; reps.min = '0'; reps.className = 'ex-reps';
  reps.value = values.reps != null ? values.reps : '';
  reps.placeholder = 'Reps';

  const weight = document.createElement('input');
  weight.type = 'number'; weight.min = '0'; weight.className = 'ex-weight';
  weight.value = values.weight != null ? values.weight : '';
  weight.placeholder = 'Kg';

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'row-delete';
  del.title = 'Remove exercise';
  del.innerHTML = DELETE_ICON;
  del.addEventListener('click', function () { row.remove(); });

  row.appendChild(select);
  row.appendChild(sets);
  row.appendChild(reps);
  row.appendChild(weight);
  row.appendChild(del);
  rowsContainer.appendChild(row);
}

function collectItems() {
  const rows = rowsContainer.querySelectorAll('.exercise-row');
  const items = [];
  rows.forEach(function (row) {
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
  const title = nameInput.value.trim();
  if (!title) {
    setStatus('Please enter a program name', 'error');
    return;
  }
  const items = collectItems();
  if (items.length === 0) {
    setStatus('Add at least one exercise', 'error');
    return;
  }

  const payload = {
    title: title,
    sessionsPerWeek: Number(sessionsInput.value) || 0,
    items: items
  };

  saveBtn.disabled = true;
  setStatus('Saving...');

  const request = currentProgramId
    ? apiFetch('/programs/' + currentProgramId, { method: 'PUT', body: JSON.stringify(payload) })
    : apiFetch('/programs', { method: 'POST', body: JSON.stringify(payload) });

  request.then(function () {
    showToast('Program saved', 'success');
    loadProgram();
  }).catch(function (err) {
    saveBtn.disabled = false;
    setStatus(err.message, 'error');
  });
}

function fillProgram(program) {
  currentProgramId = program._id;
  pageTitle.textContent = 'My Program';
  nameInput.value = program.title || '';
  sessionsInput.value = program.sessionsPerWeek || 0;
  rowsContainer.innerHTML = '';
  if (program.items && program.items.length) {
    program.items.forEach(function (item) { addRow(item); });
  } else {
    addRow();
  }
}

function loadProgram() {
  saveBtn.disabled = false;
  return apiFetch('/programs').then(function (data) {
    if (data.programs && data.programs.length) {
      fillProgram(data.programs[0]);
    } else {
      currentProgramId = null;
      pageTitle.textContent = 'Create Program';
      rowsContainer.innerHTML = '';
      addRow();
    }
  }).catch(function (err) {
    setStatus('Could not load program. ' + err.message, 'error');
    addRow();
  });
}

function init() {
  addBtn.addEventListener('click', function () { addRow(); });
  saveBtn.addEventListener('click', save);

  loadExerciseNames().then(function (names) {
    exerciseNames = names;
    loadProgram();
  });
}

init();
