import os

os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5432/report_generator_test",
)
os.environ["PUBLIC_BASE_URL"] = "http://frontend.test"

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app import app  # noqa: E402
from config import BASE_DIR  # noqa: E402
from db import SessionLocal, engine  # noqa: E402
from models.db import Report, ReportPage  # noqa: E402
from services.scraper.service import get_scraper  # noqa: E402
from tests.fixtures.sample_site import make_scraper  # noqa: E402
from utils.dates import utcnow  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def migrated_database():
    alembic_config = Config(str(BASE_DIR / "alembic.ini"))
    command.upgrade(alembic_config, "head")
    yield
    command.downgrade(alembic_config, "base")


@pytest.fixture(autouse=True)
def clean_tables():
    yield
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE report_pages, reports RESTART IDENTITY CASCADE"))


@pytest.fixture
def db():
    with SessionLocal() as session:
        yield session


@pytest.fixture
def client():
    app.dependency_overrides[get_scraper] = make_scraper
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_report() -> Report:
    """An unsaved report with two pages, including HTML-like text that must be escaped."""
    now = utcnow()
    return Report(
        slug="sample-site-abc123",
        source_url="https://sample.test/",
        site_name="Sample <Site>",
        page_count=2,
        created_at=now,
        pages=[
            ReportPage(
                position=1,
                url="https://sample.test/",
                title="Home <script>alert(1)</script>",
                meta_description="Sample home page description.",
                headings=[{"level": 1, "text": "Welcome"}, {"level": 2, "text": "Features"}],
                summary="Sample summary text for the home page.",
                word_count=1200,
                link_count=40,
                image_count=5,
                fetched_at=now,
            ),
            ReportPage(
                position=2,
                url="https://sample.test/pricing",
                title="Pricing",
                meta_description=None,
                headings=[],
                summary="Pricing summary text.",
                word_count=300,
                link_count=12,
                image_count=1,
                fetched_at=now,
            ),
        ],
    )
