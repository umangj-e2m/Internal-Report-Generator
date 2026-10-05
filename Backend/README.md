# Website Report Generator – Backend

FastAPI service that reads a website (the entered URL plus up to 4 internal links), stores the extracted
content in PostgreSQL and serves it as an HTML view, a PDF (fixed logo header, page-numbered footer)
a DOCX with the same layout, and a 16:9 slide deck (PPTX download plus an in-browser slide view).

## Requirements

- Python 3.11+
- PostgreSQL 15+ running locally

## Setup (Windows PowerShell)

```powershell
cd Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m playwright install chromium     # browser used to render PDFs

Copy-Item .env.example .env               # then edit DATABASE_URL if needed
# create the database once, e.g. in psql:  CREATE DATABASE report_generator;

python -m scripts.data.seed_reports       # optional: load 4 sample reports (run after the first start)
```

## Run

```powershell
python app.py
```

This applies any pending Alembic migrations (`alembic upgrade head`) and then starts uvicorn with
auto-reload on http://127.0.0.1:8000. Host, port and reload come from `APP_HOST`, `APP_PORT` and
`APP_RELOAD` in `.env`. `uvicorn app:app --reload --port 8000` still works but does not run migrations.

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | API and database status |
| POST | `/api/reports` | Body `{"url": "https://example.com"}`: read the site and create a report |
| GET | `/api/reports?page=1&page_size=10&search=` | Paginated list, newest first |
| GET | `/api/reports/style-options` | The 3 colour palettes, 3 fonts and 3 text sizes a report can use |
| GET | `/api/reports/{slug}` | Report with all pages and its `style` (JSON) |
| PUT | `/api/reports/{slug}/style` | Body `{"palette": "ocean", "font_family": "georgia", "font_size": "large"}`: save the report's style, applied to every export |
| GET | `/api/reports/{slug}/html` | Report as a web page |
| GET | `/api/reports/{slug}/pdf` | PDF shown inline; add `?download=true` to download |
| GET | `/api/reports/{slug}/docx` | DOCX download |
| GET | `/api/reports/{slug}/slides` | Slide deck as a web page (same slides as the PPTX) |
| GET | `/api/reports/{slug}/pptx` | PPTX download |
| DELETE | `/api/reports/{slug}` | Delete a report |

A website that cannot be read returns `422` with a readable `detail` message; an unknown slug returns `404`.

## Project layout

| Path | Contents |
|---|---|
| `app.py` | FastAPI app, CORS, routers, error handlers |
| `config.py` | All settings (loaded from `.env`) |
| `db.py` | SQLAlchemy engine and session dependency |
| `routes/` | Thin HTTP layer (`health.py`, `reports.py`) |
| `services/scraper/` | Fetching pages, following internal links, extracting content |
| `services/reports/` | Creating, listing, fetching and deleting reports |
| `services/exports/` | HTML (Jinja2 template), PDF (Playwright/Chromium), DOCX (python-docx) and PPTX (python-pptx) builders; charts (matplotlib); `slides.py` builds the slide deck shared by the PPTX and the HTML slide view |
| `models/db/` | SQLAlchemy tables · `models/schemas/` API schemas · `models/domain/` scraper data classes |
| `utils/` | Generic helpers (dates, slugs, strings) |
| `log_config/` | Logging setup (the SOP's `logging/` folder, renamed so it does not shadow Python's `logging` module) |
| `sql/` | Migrations, schema snapshot and seed data (see `sql/README.md`) |
| `scripts/data/` | `seed_reports.py` |
| `tests/` | `services/`, `routes/`, `integration/`, `smoke/`, shared `fixtures/` |

The report logo is read from `REPORT_LOGO_PATH` (default: `../Frontend/public/E2M_Logo-Black.png`),
so the frontend and the exported documents always use the same file.

## Tests

Tests use a separate database (default `report_generator_test`, override with `TEST_DATABASE_URL`).
Create it once, then run:

```powershell
pytest
```

Migrations are applied at the start of the test run and rolled back at the end. Website reading is tested
against a fake site (`tests/fixtures/sample_site.py`), so tests never call the internet.

No background worker is used: reading 5 pages takes a few seconds and runs inside the request.
Docker is intentionally not used for this project.
