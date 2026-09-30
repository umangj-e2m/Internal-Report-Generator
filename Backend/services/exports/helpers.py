import base64
import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from config import get_settings
from models.db import Report
from services.exports.charts import build_charts, build_page_chart
from services.reports.helpers import share_url
from services.shared.constants import REPORT_TITLE
from utils.dates import format_display, utcnow
from utils.strings import truncate

logger = logging.getLogger(__name__)

SUMMARY_TABLE_DESCRIPTION_CHARS = 150


@dataclass(frozen=True)
class ReportTotals:
    words: int
    links: int
    images: int


def compute_totals(report: Report) -> ReportTotals:
    return ReportTotals(
        words=sum(page.word_count for page in report.pages),
        links=sum(page.link_count for page in report.pages),
        images=sum(page.image_count for page in report.pages),
    )


def generated_at_label() -> str:
    return format_display(utcnow(), get_settings().report_timezone)


def logo_path() -> Path | None:
    path = get_settings().report_logo_path
    if path.is_file():
        return path
    logger.warning("Report logo not found at %s; exporting without a logo", path)
    return None


@lru_cache
def _logo_data_uri(path: str, mtime: float) -> str:
    encoded = base64.b64encode(Path(path).read_bytes()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def logo_data_uri() -> str | None:
    path = logo_path()
    return _logo_data_uri(str(path), path.stat().st_mtime) if path else None


def page_description(page, max_chars: int = SUMMARY_TABLE_DESCRIPTION_CHARS) -> str:
    return truncate(page.meta_description or page.summary, max_chars)


def build_context(report: Report) -> dict:
    settings = get_settings()
    return {
        "report_title": REPORT_TITLE,
        "brand_name": settings.report_brand_name,
        "report": report,
        "pages": report.pages,
        "totals": compute_totals(report),
        "charts": build_charts(report, "svg"),
        "page_chart": lambda page: build_page_chart(page, "svg"),
        "created_at": format_display(report.created_at, settings.report_timezone),
        "generated_at": generated_at_label(),
        "share_url": share_url(report.slug),
        "logo_src": logo_data_uri(),
        "page_description": page_description,
        "fetched_label": lambda value: format_display(value, settings.report_timezone),
    }
