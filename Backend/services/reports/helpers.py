from dataclasses import asdict

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from config import get_settings
from models.db import Report, ReportPage
from models.domain.scraped_page import ScrapedPage
from models.schemas.responses import ReportDetailOut, ReportSummaryOut
from services.exports.themes import theme_for
from utils.slugs import make_slug

MAX_SLUG_ATTEMPTS = 5


def unique_slug(db: Session, site_name: str) -> str:
    for _ in range(MAX_SLUG_ATTEMPTS):
        slug = make_slug(site_name)
        if not db.scalar(select(exists().where(Report.slug == slug))):
            return slug
    return make_slug(site_name, suffix_length=10)


def to_page_row(position: int, page: ScrapedPage) -> ReportPage:
    return ReportPage(
        position=position,
        url=page.url,
        title=page.title,
        meta_description=page.meta_description,
        headings=[asdict(heading) for heading in page.headings],
        summary=page.summary,
        word_count=page.word_count,
        link_count=page.link_count,
        image_count=page.image_count,
        fetched_at=page.fetched_at,
    )


def share_url(slug: str) -> str:
    """Public link to the report's standalone HTML view."""
    settings = get_settings()
    return f"{settings.public_base_url.rstrip('/')}{settings.api_prefix}/reports/{slug}/html"


def to_summary(report: Report) -> ReportSummaryOut:
    return ReportSummaryOut.model_validate(
        {**_report_fields(report), "share_url": share_url(report.slug)}
    )


def to_detail(report: Report) -> ReportDetailOut:
    theme = theme_for(report)
    return ReportDetailOut.model_validate({
        **_report_fields(report),
        "share_url": share_url(report.slug),
        "style": {
            "palette": theme.palette.key,
            "font_family": theme.font.key,
            "font_size": theme.size.key,
        },
        "pages": report.pages,
    })


def _report_fields(report: Report) -> dict:
    return {
        "slug": report.slug,
        "source_url": report.source_url,
        "site_name": report.site_name,
        "page_count": report.page_count,
        "created_at": report.created_at,
    }
