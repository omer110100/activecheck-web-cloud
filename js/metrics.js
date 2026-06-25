/* ===========================================
   ActiveCheck - Metrics
   Profile info (PUT /users/me) + weight measurements
   (CRUD) + a Chart.js weight progress chart.
   Requires api.js, ui.js, shell.js, Chart.js (CDN).
   =========================================== */

const firstNameEl = document.getElementById('firstName');
const lastNameEl = document.getElementById('lastName');
const genderEl = document.getElementById('gender');
const heightEl = document.getElementById('height');
const phoneEl = document.getElementById('phone');
const yearEl = document.getElementById('yearOfBirth');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profileStatus = document.getElementById('profileStatus');

const weightDateEl = document.getElementById('weightDate');
const weightValueEl = document.getElementById('weightValue');
const addWeightBtn = document.getElementById('addWeightBtn');
const weightBody = document.getElementById('weightBody');
const chartEmpty = document.getElementById('chartEmpty');
const chartCanvas = document.getElementById('weightChart');

const DELETE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/>' +
  '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

let weightChart = null;

function formatDate(value) {
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return dd + '/' + mm + '/' + d.getFullYear();
}

/* ---------- Profile ---------- */
function loadProfile() {
  apiFetch('/users/me').then(function (data) {
    const u = data.user;
    setUser(u);
    const parts = (u.name || '').trim().split(' ');
    firstNameEl.value = parts.shift() || '';
    lastNameEl.value = parts.join(' ');
    genderEl.value = u.gender || '';
    heightEl.value = u.height != null ? u.height : '';
    phoneEl.value = u.phone || '';
    yearEl.value = u.yearOfBirth != null ? u.yearOfBirth : '';
  }).catch(function (err) {
    profileStatus.textContent = 'Could not load profile. ' + err.message;
    profileStatus.className = 'field-message error-text';
  });
}

function saveProfile() {
  const name = (firstNameEl.value.trim() + ' ' + lastNameEl.value.trim()).trim();
  if (!name) {
    profileStatus.textContent = 'Please enter your name';
    profileStatus.className = 'field-message error-text';
    return;
  }
  const payload = {
    name: name,
    gender: genderEl.value.trim(),
    height: heightEl.value ? Number(heightEl.value) : null,
    phone: phoneEl.value.trim(),
    yearOfBirth: yearEl.value ? Number(yearEl.value) : null
  };
  saveProfileBtn.disabled = true;
  profileStatus.textContent = 'Saving...';
  profileStatus.className = 'field-message';

  apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(payload) })
    .then(function (data) {
      setUser(data.user);
      profileStatus.textContent = 'Profile saved';
      profileStatus.className = 'field-message success-text';
      saveProfileBtn.disabled = false;
      showToast('Profile updated', 'success');
    })
    .catch(function (err) {
      profileStatus.textContent = err.message;
      profileStatus.className = 'field-message error-text';
      saveProfileBtn.disabled = false;
    });
}

/* ---------- Measurements ---------- */
function renderChart(measurements) {
  if (measurements.length === 0) {
    chartCanvas.classList.add('hidden');
    chartEmpty.classList.remove('hidden');
    if (weightChart) { weightChart.destroy(); weightChart = null; }
    return;
  }
  chartCanvas.classList.remove('hidden');
  chartEmpty.classList.add('hidden');

  const labels = measurements.map(function (m) { return formatDate(m.date); });
  const data = measurements.map(function (m) { return m.weightKg; });

  if (weightChart) weightChart.destroy();
  weightChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Weight (kg)',
        data: data,
        borderColor: '#84a82e',
        backgroundColor: 'rgba(163, 230, 53, 0.25)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#84a82e'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false } }
    }
  });
}

function renderMeasurements(measurements) {
  if (measurements.length === 0) {
    weightBody.innerHTML = '<tr><td colspan="3" class="state-row">No measurements yet.</td></tr>';
  } else {
    weightBody.innerHTML = '';
    measurements.forEach(function (m) {
      const tr = document.createElement('tr');

      const dateTd = document.createElement('td');
      dateTd.textContent = formatDate(m.date);
      const weightTd = document.createElement('td');
      weightTd.textContent = m.weightKg + ' kg';

      const actionTd = document.createElement('td');
      const wrap = document.createElement('div');
      wrap.className = 'row-actions';
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'icon-btn';
      del.title = 'Delete measurement';
      del.innerHTML = DELETE_ICON;
      del.addEventListener('click', function () { confirmDelete(m._id); });
      wrap.appendChild(del);
      actionTd.appendChild(wrap);

      tr.appendChild(dateTd);
      tr.appendChild(weightTd);
      tr.appendChild(actionTd);
      weightBody.appendChild(tr);
    });
  }
  renderChart(measurements);
}

function loadMeasurements() {
  weightBody.innerHTML = '<tr><td colspan="3" class="state-row">Loading...</td></tr>';
  apiFetch('/measurements')
    .then(function (data) { renderMeasurements(data.measurements); })
    .catch(function (err) {
      weightBody.innerHTML =
        '<tr><td colspan="3" class="state-row">Could not load measurements. ' + err.message + '</td></tr>';
    });
}

function addMeasurement() {
  const date = weightDateEl.value;
  const weight = weightValueEl.value;
  if (!date || !weight) {
    showToast('Please enter a date and weight', 'error');
    return;
  }
  addWeightBtn.disabled = true;
  apiFetch('/measurements', {
    method: 'POST',
    body: JSON.stringify({ date: date, weightKg: Number(weight) })
  }).then(function () {
    weightValueEl.value = '';
    addWeightBtn.disabled = false;
    showToast('Measurement added', 'success');
    loadMeasurements();
  }).catch(function (err) {
    addWeightBtn.disabled = false;
    showToast(err.message, 'error');
  });
}

function confirmDelete(id) {
  showConfirm('Delete this measurement?', { confirmText: 'Delete' }).then(function (ok) {
    if (!ok) return;
    apiFetch('/measurements/' + id, { method: 'DELETE' })
      .then(function () {
        showToast('Measurement deleted', 'success');
        loadMeasurements();
      })
      .catch(function (err) { showToast(err.message, 'error'); });
  });
}

function init() {
  weightDateEl.value = new Date().toISOString().slice(0, 10);
  saveProfileBtn.addEventListener('click', saveProfile);
  addWeightBtn.addEventListener('click', addMeasurement);
  loadProfile();
  loadMeasurements();
}

init();
