import base64
import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from PIL import Image

from config import get_settings
from models.db import Report
from services.exports.charts import build_charts, build_page_chart
from services.exports.themes import Brand, theme_for
from services.reports.helpers import share_url
from services.shared.constants import REPORT_TITLE
from utils.dates import format_display, utcnow
from utils.strings import truncate

logger = logging.getLogger(__name__)

SUMMARY_TABLE_DESCRIPTION_CHARS = 150
WIDE_LOGO_ASPECT = 1.5


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


def logo_path(brand: Brand) -> Path | None:
    path = get_settings().report_logo_dir / brand.logo_file
    if path.is_file():
        return path
    logger.warning("Logo for %s not found at %s; exporting without a logo", brand.name, path)
    return None


@lru_cache
def _logo_data_uri(path: str, mtime: float) -> str:
    encoded = base64.b64encode(Path(path).read_bytes()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


@lru_cache
def _logo_aspect(path: str, mtime: float) -> float:
    with Image.open(path) as image:
        return image.width / image.height


def logo_data_uri(brand: Brand) -> str | None:
    path = logo_path(brand)
    return _logo_data_uri(str(path), path.stat().st_mtime) if path else None


def show_brand_name(brand: Brand) -> bool:
    """Whether the company name goes beside the logo: not when the logo already spells it."""
    return not brand.wordmark or logo_path(brand) is None


def logo_aspect(brand: Brand) -> float:
    """Width divided by height of the brand's logo; 1 when the logo is missing."""
    path = logo_path(brand)
    return _logo_aspect(str(path), path.stat().st_mtime) if path else 1.0


def header_logo_height_mm(brand: Brand) -> float:
    """Wide logos sit a little shorter in page headers so they don't dominate them."""
    return (7 if logo_aspect(brand) > WIDE_LOGO_ASPECT else 9) * brand.logo_scale


def page_description(page, max_chars: int = SUMMARY_TABLE_DESCRIPTION_CHARS) -> str:
    return truncate(page.meta_description or page.summary, max_chars)


def build_context(report: Report) -> dict:
    settings = get_settings()
    theme = theme_for(report)
    return {
        "report_title": REPORT_TITLE,
        "brand_name": theme.brand.name,
        "show_brand_name": show_brand_name(theme.brand),
        "report": report,
        "pages": report.pages,
        "theme": theme,
        "totals": compute_totals(report),
        "charts": build_charts(report, "svg"),
        "page_chart": lambda page: build_page_chart(page, "svg", theme),
        "created_at": format_display(report.created_at, settings.report_timezone),
        "generated_at": generated_at_label(),
        "share_url": share_url(report.slug),
        "logo_src": logo_data_uri(theme.brand),
        "logo_scale": theme.brand.logo_scale,
        "page_description": page_description,
        "fetched_label": lambda value: format_display(value, settings.report_timezone),
    }
