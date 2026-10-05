from pathlib import Path
from typing import Literal

from jinja2 import Environment, FileSystemLoader, select_autoescape

from models.db import Report
from services.exports import slide_layout
from services.exports import slides as slide_model
from services.exports.helpers import build_context, logo_aspect, logo_data_uri, show_brand_name

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


def render_slides_html(report: Report) -> str:
    deck = slide_model.build_deck(report, "svg")
    brand = deck.theme.brand
    aspect = logo_aspect(brand)
    return _env.get_template("slides.html").render(
        deck=deck,
        theme=deck.theme,
        L=slide_layout,
        S=slide_model,
        logo_src=logo_data_uri(brand),
        show_brand_name=show_brand_name(brand),
        logo_box=lambda box, align="left": slide_layout.fit_logo(
            box, aspect, align, brand.logo_scale
        ),
        box=_box,
    )


def _box(box: tuple[float, float, float, float]) -> str:
    x, y, width, height = box
    return (f"left:calc(var(--in)*{x:.4f});top:calc(var(--in)*{y:.4f});"
            f"width:calc(var(--in)*{width:.4f});height:calc(var(--in)*{height:.4f})")
