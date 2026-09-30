from pathlib import Path
from typing import Literal

from jinja2 import Environment, FileSystemLoader, select_autoescape

from models.db import Report
from services.exports.helpers import build_context

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"

_env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(["html"]),
    trim_blocks=True,
    lstrip_blocks=True,
)

RenderMode = Literal["web", "print"]


def render_report_html(report: Report, mode: RenderMode = "web") -> str:
    """`web` includes an in-page header/footer; `print` leaves them to the PDF renderer."""
    return _env.get_template("report.html").render(**build_context(report), mode=mode)
