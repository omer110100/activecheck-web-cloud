/* ===========================================
   ActiveCheck - Find A Coach
   Loads coaches from the API, supports live search,
   and lets the trainee request an assignment.
   Requires api.js, ui.js, shell.js.
   =========================================== */

const coachListEl = document.getElementById('coachList');
const searchInput = document.getElementById('coachSearch');

let allCoaches = [];

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

function requestCoach(coachId, btn) {
  btn.disabled = true;
  apiFetch('/requests', { method: 'POST', body: JSON.stringify({ coachId: coachId }) })
    .then(function () {
      markRequested(btn);
      showToast('Assignment requested', 'success');
    })
    .catch(function (err) {
      if (/pending/i.test(err.message)) {
        markRequested(btn);
        showToast('You already requested this coach', 'info');
      } else {
        btn.disabled = false;
        showToast(err.message, 'error');
      }
    });
}

function markRequested(btn) {
  btn.textContent = 'Assignment Requested';
  btn.classList.remove('btn-primary');
  btn.classList.add('btn-requested');
  btn.disabled = true;
}

function createCoachCard(coach) {
  const card = document.createElement('div');
  card.className = 'coach-card';

  const img = document.createElement('img');
  img.src = makeAvatar(coach.name);
  img.alt = coach.name;

  const info = document.createElement('div');
  info.className = 'coach-info';

  const nameEl = document.createElement('div');
  nameEl.className = 'coach-name';
  nameEl.textContent = coach.name;

  const metaEl = document.createElement('div');
  metaEl.className = 'coach-meta';
  metaEl.textContent = 'Personal Coach';

  const bioEl = document.createElement('div');
  bioEl.className = 'coach-bio';
  bioEl.textContent = coach.bio || 'Certified coach ready to help you reach your goals.';

  info.appendChild(nameEl);
  info.appendChild(metaEl);
  info.appendChild(bioEl);

  const btn = document.createElement('button');
  btn.className = 'btn btn-primary';
  btn.textContent = 'Request Assignment';
  btn.addEventListener('click', function () { requestCoach(coach._id, btn); });

  card.appendChild(img);
  card.appendChild(info);
  card.appendChild(btn);
  return card;
}

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

function getFilteredCoaches() {
  const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (!term) return allCoaches;
  return allCoaches.filter(function (coach) {
    return coach.name.toLowerCase().includes(term);
  });
}

function loadCoaches() {
  apiFetch('/users/coaches')
    .then(function (data) {
      allCoaches = data.coaches;
      renderCoaches(getFilteredCoaches());
    })
    .catch(function (err) {
      coachListEl.innerHTML =
        '<p class="no-results">Could not load coaches. ' + err.message + '</p>';
    });
}

if (searchInput) {
  searchInput.addEventListener('input', function () {
    renderCoaches(getFilteredCoaches());
  });
}

loadCoaches();
