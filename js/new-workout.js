/* ===========================================
   ActiveCheck - New / Edit Workout
   - Exercise names come from the wger external API
     (with a built-in fallback list if it fails).
   - Create (POST) or edit (PUT when ?id= is present).
   Requires api.js, ui.js, shell.js.
   =========================================== */

// wger ignores ?language=, so we fetch a chunk and keep English (id 2) client-side.
const WGER_URL =
  'https://wger.de/api/v2/exercise-translation/?limit=400&format=json';
const WGER_ENGLISH_ID = 2;

const FALLBACK_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Pull Up', 'Push Up',
  'Shoulder Press', 'Lunge', 'Bicep Curl', 'Tricep Extension', 'Plank'
];

const DELETE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/>' +
  '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

const rowsContainer = document.getElementById('exerciseRows');
const addBtn = document.getElementById('addExerciseBtn');
const saveBtn = document.getElementById('saveBtn');
const dateInput = document.getElementById('workoutDate');
const analyticsCheckbox = document.getElementById('includeAnalytics');
const statusEl = document.getElementById('formStatus');
const pageTitle = document.getElementById('pageTitle');

const params = new URLSearchParams(window.location.search);
const workoutId = params.get('id');

let exerciseNames = FALLBACK_EXERCISES.slice();

function setStatus(message, type) {
  statusEl.textContent = message || '';
  statusEl.className = 'field-message form-status text-center' +
    (type ? ' ' + type + '-text' : '');
}

function isoDate(value) {
  const d = value ? new Date(value) : new Date();
  return d.toISOString().slice(0, 10);
}

function buildExerciseOptions(selectedName) {
  let names = exerciseNames.slice();
  if (selectedName && names.indexOf(selectedName) === -1) {
    names.unshift(selectedName);
  }
  let html = '<option value="">Select exercise</option>';
  names.forEach(function (name) {
    const sel = name === selectedName ? ' selected' : '';
    html += '<option value="' + name + '"' + sel + '>' + name + '</option>';
  });
  return html;
}

function addRow(values) {
  values = values || {};
  const row = document.createElement('div');
  row.className = 'exercise-row';

  const select = document.createElement('select');
  select.className = 'ex-name';
  select.innerHTML = buildExerciseOptions(values.name);

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

function collectExercises() {
  const rows = rowsContainer.querySelectorAll('.exercise-row');
  const result = [];
  rows.forEach(function (row) {
    const name = row.querySelector('.ex-name').value;
    if (!name) return; // skip empty rows
    result.push({
      name: name,
      sets: Number(row.querySelector('.ex-sets').value) || 0,
      reps: Number(row.querySelector('.ex-reps').value) || 0,
      weight: Number(row.querySelector('.ex-weight').value) || 0
    });
  });
  return result;
}

function save() {
  setStatus('');
  const date = dateInput.value;
  if (!date) {
    setStatus('Please choose a date', 'error');
    return;
  }
  const exercises = collectExercises();
  if (exercises.length === 0) {
    setStatus('Add at least one exercise', 'error');
    return;
  }

  const payload = {
    date: date,
    includeInAnalytics: analyticsCheckbox.checked,
    exercises: exercises
  };

  saveBtn.disabled = true;
  setStatus('Saving...');

  const request = workoutId
    ? apiFetch('/workouts/' + workoutId, { method: 'PUT', body: JSON.stringify(payload) })
    : apiFetch('/workouts', { method: 'POST', body: JSON.stringify(payload) });

  request.then(function () {
    showToast('Workout saved', 'success');
    setTimeout(function () { window.location.href = 'workout-history.html'; }, 600);
  }).catch(function (err) {
    saveBtn.disabled = false;
    setStatus(err.message, 'error');
  });
}

function loadExerciseNames() {
  return fetch(WGER_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('wger request failed');
      return res.json();
    })
    .then(function (data) {
      const names = (data.results || [])
        .filter(function (r) { return r.language === WGER_ENGLISH_ID; })
        .map(function (r) { return (r.name || '').trim(); })
        .filter(function (n) { return n.length > 0; });
      const unique = Array.from(new Set(names)).sort();
      if (unique.length) {
        exerciseNames = unique;
      } else {
        showToast('Using built-in exercise list', 'info');
      }
    })
    .catch(function () {
      showToast('Exercise API unavailable, using built-in list', 'info');
    });
}

function loadWorkoutForEdit() {
  return apiFetch('/workouts/' + workoutId).then(function (data) {
    const w = data.workout;
    dateInput.value = isoDate(w.date);
    analyticsCheckbox.checked = w.includeInAnalytics;
    if (w.exercises.length) {
      w.exercises.forEach(function (ex) { addRow(ex); });
    } else {
      addRow();
    }
  });
}

function init() {
  dateInput.value = isoDate();
  addBtn.addEventListener('click', function () { addRow(); });
  saveBtn.addEventListener('click', save);

  loadExerciseNames().then(function () {
    if (workoutId) {
      pageTitle.textContent = 'Edit Workout';
      loadWorkoutForEdit().catch(function (err) {
        setStatus('Could not load workout. ' + err.message, 'error');
      });
    } else {
      addRow();
    }
  });
}

init();
