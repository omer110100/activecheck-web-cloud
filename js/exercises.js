/* ===========================================
   ActiveCheck - Exercise names (external API)
   Shared by New Workout and Program pages.
   Loads English exercise names from the wger API,
   with a built-in fallback list if it fails.
   Requires ui.js (for the fallback toast).
   =========================================== */

// wger ignores ?language=, so we fetch a chunk and keep English (id 2) client-side.
const WGER_URL = 'https://wger.de/api/v2/exercise-translation/?limit=400&format=json';
const WGER_ENGLISH_ID = 2;

const FALLBACK_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Pull Up', 'Push Up',
  'Shoulder Press', 'Lunge', 'Bicep Curl', 'Tricep Extension', 'Plank'
];

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
      if (unique.length) return unique;
      if (typeof showToast === 'function') showToast('Using built-in exercise list', 'info');
      return FALLBACK_EXERCISES.slice();
    })
    .catch(function () {
      if (typeof showToast === 'function') {
        showToast('Exercise API unavailable, using built-in list', 'info');
      }
      return FALLBACK_EXERCISES.slice();
    });
}

function buildExerciseOptions(names, selectedName) {
  let list = names.slice();
  if (selectedName && list.indexOf(selectedName) === -1) {
    list.unshift(selectedName);
  }
  let html = '<option value="">Select exercise</option>';
  list.forEach(function (name) {
    const sel = name === selectedName ? ' selected' : '';
    html += '<option value="' + name + '"' + sel + '>' + name + '</option>';
  });
  return html;
}
