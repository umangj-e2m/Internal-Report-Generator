import logging

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from models.db import Report
from services.reports.exceptions import ReportNotFoundError
from services.reports.helpers import to_page_row, unique_slug
from services.scraper.service import WebsiteScraper

logger = logging.getLogger(__name__)


def create_report(db: Session, url: str, scraper: WebsiteScraper) -> Report:
    result = scraper.scrape(url)
    report = Report(
        slug=unique_slug(db, result.site_name),
        source_url=result.source_url,
        site_name=result.site_name,
        page_count=len(result.pages),
        pages=[to_page_row(index, page) for index, page in enumerate(result.pages, start=1)],
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    logger.info("Created report %s for %s", report.slug, report.source_url)
    return report


def list_reports(
    db: Session, page: int, page_size: int, search: str | None = None
) -> tuple[list[Report], int]:
    query = select(Report)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(or_(Report.site_name.ilike(pattern), Report.source_url.ilike(pattern)))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(
        query.order_by(Report.created_at.desc(), Report.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return list(items), total


def get_report(db: Session, slug: str) -> Report:
    report = db.scalar(select(Report).options(selectinload(Report.pages)).where(Report.slug == slug))
    if report is None:
        raise ReportNotFoundError(slug)
    return report


def delete_report(db: Session, slug: str) -> None:
    report = get_report(db, slug)
    db.delete(report)
    db.commit()
    logger.info("Deleted report %s", slug)
