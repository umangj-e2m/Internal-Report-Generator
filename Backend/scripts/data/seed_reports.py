"""Load the sample website reports from sql/seeds/sample_reports.json.

Usage (from the Backend folder):
    python -m scripts.data.seed_reports          # insert missing sample reports
    python -m scripts.data.seed_reports --reset  # delete and re-insert sample reports
"""
import argparse
import json
import logging
from datetime import timedelta
from pathlib import Path

from sqlalchemy import delete, select

from config import BASE_DIR, get_settings
from db import SessionLocal
from log_config import setup_logging
from models.db import Report, ReportPage
from utils.dates import utcnow

SEED_FILE = BASE_DIR / "sql" / "seeds" / "sample_reports.json"

logger = logging.getLogger("seed_reports")


def load_seed_data(path: Path = SEED_FILE) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def seed(reset: bool = False) -> int:
    data = load_seed_data()
    slugs = [item["slug"] for item in data]
    created = 0

    with SessionLocal() as db:
        if reset:
            db.execute(delete(Report).where(Report.slug.in_(slugs)))
            db.commit()

        existing = set(db.scalars(select(Report.slug).where(Report.slug.in_(slugs))))
        for offset, item in enumerate(data):
            if item["slug"] in existing:
                logger.info("Skipping %s (already exists)", item["slug"])
                continue
            fetched_at = utcnow() - timedelta(days=len(data) - offset)
            report = Report(
                slug=item["slug"],
                site_name=item["site_name"],
                source_url=item["source_url"],
                page_count=len(item["pages"]),
                created_at=fetched_at,
                updated_at=fetched_at,
                pages=[
                    ReportPage(position=position, fetched_at=fetched_at, **page)
                    for position, page in enumerate(item["pages"], start=1)
                ],
            )
            db.add(report)
            created += 1
        db.commit()

    logger.info("Seeded %s report(s)", created)
    return created


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--reset", action="store_true", help="delete sample reports before inserting")
    args = parser.parse_args()
    setup_logging(get_settings().log_level)
    seed(reset=args.reset)
