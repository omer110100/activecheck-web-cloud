/* ===========================================
   ActiveCheck - Coaches
   Loads coach data from JSON, renders cards
   dynamically, and supports live search filtering.
   =========================================== */

const coachListEl = document.getElementById('coachList');
const searchInput = document.getElementById('coachSearch');

let allCoaches = []; // holds the loaded data

/* ---------- Make a local avatar (initials on a colored circle) ---------- */
function makeAvatar(name) {
  const initials = name
    .split(' ')
    .map(function (w) { return w.charAt(0); })
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
    '<circle cx="32" cy="32" r="32" fill="#a3e635"/>' +
    '<text x="50%" y="50%" dy=".35em" text-anchor="middle" ' +
    'font-family="Poppins, sans-serif" font-size="24" font-weight="700" ' +
    'fill="#1a1a1a">' + initials + '</text></svg>';

  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/* ---------- Build a single coach card ---------- */
function createCoachCard(coach) {
  const card = document.createElement('div');
  card.className = 'coach-card';

  card.innerHTML = `
    <img src="${makeAvatar(coach.name)}" alt="${coach.name}" />
    <div class="coach-info">
      <div class="coach-name">${coach.name}</div>
      <div class="coach-meta">${coach.location} - ${coach.experience}</div>
      <div class="coach-bio">${coach.bio}</div>
    </div>
    <button class="btn btn-primary">Request Assignment</button>
  `;

  // interaction: clicking the button gives feedback
  const btn = card.querySelector('button');
  btn.addEventListener('click', function () {
    btn.textContent = 'Requested ✓';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-dark');
    btn.disabled = true;
  });

  return card;
}

/* ---------- Render a list of coaches ---------- */
function renderCoaches(coaches) {
  coachListEl.innerHTML = '';

  if (coaches.length === 0) {
    coachListEl.innerHTML = '<p class="no-results">No coaches found.</p>';
    return;
  }

  coaches.forEach(function (coach) {
    coachListEl.appendChild(createCoachCard(coach));
  });
}

/* ---------- Load data from JSON ---------- */
fetch('data/coaches.json')
  .then(function (response) {
    if (!response.ok) throw new Error('Failed to load coaches');
    return response.json();
  })
  .then(function (data) {
    allCoaches = data;
    renderCoaches(allCoaches);
  })
  .catch(function (error) {
    coachListEl.innerHTML =
      '<p class="no-results">Could not load coaches. ' + error.message + '</p>';
  });

/* ---------- Live search filtering (interaction) ---------- */
if (searchInput) {
  searchInput.addEventListener('input', function () {
    const term = searchInput.value.trim().toLowerCase();

    const filtered = allCoaches.filter(function (coach) {
      return (
        coach.name.toLowerCase().includes(term) ||
        coach.location.toLowerCase().includes(term)
      );
    });

    renderCoaches(filtered);
  });
}
