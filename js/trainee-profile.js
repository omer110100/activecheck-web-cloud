/* ===========================================
   ActiveCheck - Trainee Profile (coach view)
   Tabs: Workout / Body Metrics / Programs.
   All data from GET /requests/trainee/:id.
   Requires api.js, ui.js, shell.js, Chart.js.
   =========================================== */

if (currentUser && currentUser.role !== 'coach') {
  window.location.href = 'dashboard.html';
}

const params = new URLSearchParams(window.location.search);
const traineeId = params.get('id');

const tpInitial = document.getElementById('tpInitial');
const tpName = document.getElementById('tpName');
const tpWorkoutBody = document.getElementById('tpWorkoutBody');
const tpWeightBody = document.getElementById('tpWeightBody');
const tpPrograms = document.getElementById('tpPrograms');
const tpChartEmpty = document.getElementById('tpChartEmpty');
const tpChartCanvas = document.getElementById('tpWeightChart');
const createProgramBtn = document.getElementById('createProgramBtn');

let weightChart = null;

function fmt(value) {
  if (!value) return '—';
  return new Date(value).toISOString().slice(0, 10);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  });
}

/* ---------- Tabs ---------- */
const tabButtons = document.querySelectorAll('.tab');
tabButtons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    tabButtons.forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ---------- Renderers ---------- */
function renderWorkouts(workouts) {
  if (workouts.length === 0) {
    tpWorkoutBody.innerHTML = '<tr><td colspan="3" class="state-msg">No workouts logged.</td></tr>';
    return;
  }
  tpWorkoutBody.innerHTML = '';
  workouts.forEach(function (w) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + fmt(w.date) + '</td>' +
      '<td>' + w.exercises.length + '</td>' +
      '<td class="ta-right"><button class="btn btn-view btn-sm" type="button">View Workout</button></td>';
    tr.querySelector('button').addEventListener('click', function () { viewWorkout(w); });
    tpWorkoutBody.appendChild(tr);
  });
}

function viewWorkout(w) {
  let rows = '<table><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr></thead><tbody>';
  w.exercises.forEach(function (e) {
    rows += '<tr><td>' + escapeHtml(e.name) + '</td><td>' + e.sets + '</td><td>' +
      e.reps + '</td><td>' + e.weight + ' kg</td></tr>';
  });
  rows += '</tbody></table>';
  showInfo('Workout - ' + fmt(w.date), rows);
}

function renderMetrics(trainee, measurements) {
  document.getElementById('infoName').textContent = trainee.name || '—';
  document.getElementById('infoYear').textContent = trainee.yearOfBirth || '—';
  document.getElementById('infoHeight').textContent = trainee.height || '—';
  document.getElementById('infoSex').textContent = trainee.gender || '—';

  if (measurements.length === 0) {
    tpWeightBody.innerHTML = '<tr><td colspan="2" class="state-msg">No measurements.</td></tr>';
  } else {
    tpWeightBody.innerHTML = '';
    measurements.forEach(function (m) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + fmt(m.date) + '</td><td>' + m.weightKg + ' kg</td>';
      tpWeightBody.appendChild(tr);
    });
  }
  renderChart(measurements);
}

function renderChart(measurements) {
  if (measurements.length === 0) {
    tpChartCanvas.classList.add('hidden');
    tpChartEmpty.classList.remove('hidden');
    return;
  }
  tpChartCanvas.classList.remove('hidden');
  tpChartEmpty.classList.add('hidden');
  if (weightChart) weightChart.destroy();
  weightChart = new Chart(tpChartCanvas, {
    type: 'line',
    data: {
      labels: measurements.map(function (m) { return fmt(m.date); }),
      datasets: [{
        label: 'Weight (kg)',
        data: measurements.map(function (m) { return m.weightKg; }),
        borderColor: '#84a82e',
        backgroundColor: 'rgba(163, 230, 53, 0.25)',
        tension: 0.3, fill: true, pointBackgroundColor: '#84a82e'
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: false } } }
  });
}

function renderPrograms(programs) {
  if (programs.length === 0) {
    tpPrograms.innerHTML = '<p class="state-msg">No programs yet.</p>';
    return;
  }
  tpPrograms.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'programs-box';
  programs.forEach(function (p) {
    const card = document.createElement('div');
    card.className = 'program-card';
    const origin = p.coachId ? 'Coach-assigned' : 'Self-created';
    card.innerHTML =
      '<div><div class="pc-title"></div><div class="pc-sub">' + origin + '</div></div>' +
      '<button class="btn btn-view btn-sm" type="button">View Program</button>';
    card.querySelector('.pc-title').textContent = p.title;
    card.querySelector('button').addEventListener('click', function () { viewProgram(p); });
    box.appendChild(card);
  });
  tpPrograms.appendChild(box);
}

function viewProgram(p) {
  let html = '<p>Sessions per week: ' + (p.sessionsPerWeek || 0) + '</p>';
  html += '<table><thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr></thead><tbody>';
  (p.items || []).forEach(function (it) {
    html += '<tr><td>' + escapeHtml(it.exercise) + '</td><td>' + it.sets + '</td><td>' +
      it.reps + '</td><td>' + it.weight + ' kg</td></tr>';
  });
  html += '</tbody></table>';
  showInfo(p.title, html);
}

function load() {
  if (!traineeId) {
    window.location.href = 'coach-trainees.html';
    return;
  }
  createProgramBtn.href = 'create-program.html?traineeId=' + traineeId;

  apiFetch('/requests/trainee/' + traineeId).then(function (data) {
    tpName.textContent = data.trainee.name;
    tpInitial.textContent = (data.trainee.name || '?').charAt(0).toUpperCase();
    renderWorkouts(data.workouts);
    renderMetrics(data.trainee, data.measurements);
    renderPrograms(data.programs);
  }).catch(function (err) {
    tpName.textContent = 'Could not load trainee';
    tpWorkoutBody.innerHTML = '<tr><td colspan="3" class="state-msg">' + err.message + '</td></tr>';
  });
}

load();
