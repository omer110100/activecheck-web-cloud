/* ===========================================
   ActiveCheck - Trainee Dashboard
   Loads live stats: last workout, current weight,
   coach status. Requires api.js + shell.js.
   =========================================== */

const lastWorkoutEl = document.getElementById('lastWorkoutVal');
const currentWeightEl = document.getElementById('currentWeightVal');
const coachEl = document.getElementById('coachVal');

function formatDate(value) {
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return dd + '-' + mm + '-' + yyyy;
}

function loadDashboard() {
  Promise.all([
    apiFetch('/users/me'),
    apiFetch('/workouts'),
    apiFetch('/measurements')
  ]).then(function (results) {
    const user = results[0].user;
    const workouts = results[1].workouts;
    const measurements = results[2].measurements;

    // keep stored user fresh (coachId may have changed since login)
    setUser(user);

    lastWorkoutEl.textContent = workouts.length ? formatDate(workouts[0].date) : 'No workouts yet';

    if (measurements.length) {
      currentWeightEl.textContent = measurements[measurements.length - 1].weightKg + ' Kg';
    } else {
      currentWeightEl.textContent = 'No data';
    }

    if (user.coachId) {
      coachEl.textContent = 'Active';
      coachEl.classList.add('text-accent');
    } else {
      coachEl.textContent = 'None';
    }
  }).catch(function (err) {
    lastWorkoutEl.textContent = '—';
    currentWeightEl.textContent = '—';
    coachEl.textContent = '—';
    console.warn('Dashboard load failed:', err.message);
  });
}

loadDashboard();
