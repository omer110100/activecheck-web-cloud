/* ===========================================
   ActiveCheck - Central API helper
   One place for the API base URL, the auth token,
   and the fetch wrapper used by every page.
   For production, change API_BASE to the Render URL.
   =========================================== */

const API_BASE = 'http://localhost:8080/api';

function getToken() {
  return localStorage.getItem('ac_token');
}

function setToken(token) {
  localStorage.setItem('ac_token', token);
}

function clearToken() {
  localStorage.removeItem('ac_token');
  localStorage.removeItem('ac_user');
}

function setUser(user) {
  localStorage.setItem('ac_user', JSON.stringify(user));
}

function getCurrentUser() {
  const raw = localStorage.getItem('ac_user');
  return raw ? JSON.parse(raw) : null;
}

/* Wrapper around fetch: adds JSON headers + auth token,
   and throws an Error with the server message on failure. */
function apiFetch(path, options) {
  options = options || {};
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  return fetch(API_BASE + path, { ...options, headers })
    .then(function (response) {
      return response.json().then(function (body) {
        if (!response.ok) {
          throw new Error(body.error || 'Request failed');
        }
        return body;
      });
    });
}

/* Redirect to login if not authenticated. Returns the user otherwise. */
function requireLogin() {
  const user = getCurrentUser();
  if (!getToken() || !user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}
