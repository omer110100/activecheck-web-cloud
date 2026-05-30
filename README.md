# ActiveCheck 🏋️

A fitness tracking web app frontend (final project – part A).
Connects trainees and coaches: trainees can view their dashboard,
browse and request coaches, and register/login.

## Pages implemented

| Page | File | Type | Notes |
|------|------|------|-------|
| Login | `index.html` | Form | Email + password validation |
| Registration | `register.html` | **Form page** | 4 fields + role dropdown, full validation |
| Dashboard | `dashboard.html` | Main page | Stat cards + action buttons |
| Find A Coach | `coaches.html` | Main page | **Dynamic content from JSON** + live search |

## Requirements covered

- **HTML / CSS / JavaScript** – vanilla, no frameworks
- **Design tokens** – all colors/fonts/spacing defined in `:root` (`css/style.css`)
- **Responsive** – works from 320px mobile up to desktop; sidebar collapses
  into a hamburger menu on screens ≤ 768px
- **JSON dynamic content** – coaches are loaded from `data/coaches.json`
  via `fetch()` and rendered with JavaScript (`js/coaches.js`),
  not hard-coded in the HTML
- **Meaningful interactions**
  - Live search filtering of coaches (by name / city)
  - "Request Assignment" button gives click feedback
  - Mobile hamburger menu toggle
  - Form validation
- **Form validation** (`js/auth.js`) – no server connection:
  - Required fields not empty
  - Valid email format
  - Password length ≥ 6 characters
  - Password / confirm-password match (registration)
  - Role selected from dropdown (registration)
  - Error and success messages shown to the user

## Project structure

```
activecheck/
├── index.html          # Login
├── register.html       # Registration (form page)
├── dashboard.html      # Dashboard (main)
├── coaches.html        # Find A Coach (main, JSON-driven)
├── css/
│   ├── style.css       # shared tokens + base styles
│   ├── login.css       # auth pages (login + register)
│   ├── app.css         # logged-in shell (sidebar + topbar)
│   ├── dashboard.css
│   └── coaches.css
├── js/
│   ├── auth.js         # login + registration validation
│   ├── app.js          # mobile menu toggle
│   └── coaches.js      # load JSON + render + filter
└── data/
    └── coaches.json    # coach data
```

## Running locally

The Coaches page uses `fetch()` to load JSON, so it must be served over HTTP
(not opened with `file://`). From the project folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Figma

<!-- paste your Figma file link here -->
https://www.figma.com/file/QtqkU1OgHopKANnhnLUMPN

## Group members

<!-- TODO: write full names of all group members here -->
- 
- 
