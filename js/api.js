/* ===========================================
   ActiveCheck - Central API helper
   One place for the API base URL, the auth token,
   and the fetch wrapper used by every page.
   For production, change API_BASE to the Render URL.
   =========================================== */

// Production API URL — replace REPLACE_WITH_RENDER_URL after deploying the server on Render.
const PROD_API_BASE = 'https://activecheck-server.onrender.com/api';

// Use the local server during development, the Render server in production.
const isLocalHost =
  location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const API_BASE = isLocalHost ? 'http://localhost:8080/api' : PROD_API_BASE;

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
