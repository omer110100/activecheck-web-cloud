# ActiveCheck — Client

Frontend for **ActiveCheck**, a fitness app that connects trainees and coaches.
Built with vanilla HTML, CSS and JavaScript (no framework). Talks to the
ActiveCheck API over `fetch`.

## Features

**Trainee**
- Register / login (role-based)
- Dashboard with live stats
- Workouts: full CRUD, exercise names from an external API (wger)
- Body Metrics: profile + weight measurements with a Chart.js progress chart
- Personal training program (create / edit)
- Find a coach and request an assignment

**Coach**
- Dashboard: approve / reject assignment requests, see active trainees
- View a trainee's workouts, body metrics and programs
- Create training programs for trainees

## Project structure

```
activecheck-web-cloud/
├── index.html / register.html        # auth
├── dashboard.html, workouts.html, ... # trainee pages
├── coach-dashboard.html, ...          # coach pages
├── css/                               # design tokens + per-page styles
├── js/
│   ├── api.js        # API base URL + fetch wrapper + token
│   ├── shell.js      # auth guard + top bar
│   ├── ui.js         # modal + toast helpers
│   ├── exercises.js  # wger external API
│   └── ...           # per-page scripts
└── images/
```

## External API & library

- **External API:** [wger](https://wger.de/api/v2/) — exercise names for the workout/program forms.
- **JavaScript library:** [Chart.js](https://www.chartjs.org/) — weight progress chart.

## Run locally

The pages use `fetch`, so serve over HTTP (not `file://`). With the server running
on port 8080:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Configuration

`js/api.js` automatically uses `http://localhost:8080/api` during local development
and the production API URL otherwise. Set `PROD_API_BASE` in `js/api.js` to your
deployed server URL before publishing.

## Figma

https://www.figma.com/design/QtqkU1OgHopKANnhnLUMPN/ActiveCheck

## Group members

- Omer Labinsky
- Alex Tkachenkov
