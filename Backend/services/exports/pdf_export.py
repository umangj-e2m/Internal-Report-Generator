from html import escape
from io import BytesIO

from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter

from models.db import Report
from services.exports.helpers import (
    generated_at_label,
    header_logo_height_mm,
    logo_data_uri,
    WATERMARK_ANGLE,
    WATERMARK_MAX_SIZE_MM,
    WATERMARK_OPACITY,
    WATERMARK_WIDTH_MM,
    show_brand_name,
    watermark_font_size,
)
from services.exports.html_export import render_report_html
from services.exports.themes import BORDER_HEX, MUTED_HEX, ReportTheme, theme_for
from services.shared.constants import REPORT_TITLE

PAGE_MARGINS = {"top": "26mm", "bottom": "20mm", "left": "16mm", "right": "16mm"}
NO_MARGINS = {"top": "0", "bottom": "0", "left": "0", "right": "0"}

# Chromium renders header/footer templates in isolation: styles must be inline and
# font-size must be set explicitly, otherwise the text is invisible.
_WRAPPER_STYLE = "width:100%;padding:0 16mm;box-sizing:border-box;-webkit-print-color-adjust:exact;"


def _row_style(theme: ReportTheme) -> str:
    return (
        "display:flex;align-items:center;justify-content:space-between;"
        f"font-family:{theme.font.css_stack};font-size:8pt;color:#{MUTED_HEX};"
    )


def _header_template(site_name: str, theme: ReportTheme) -> str:
    brand = theme.brand
    logo = logo_data_uri(brand)
    logo_height = header_logo_height_mm(brand)
    logo_html = (
        f'<img src="{logo}" style="height:{logo_height}mm;width:auto;max-width:50mm;" />'
        if logo else ""
    )
    name_html = (
        f'<span style="font-size:10pt;font-weight:700;color:#{theme.primary};">{escape(brand.name)}</span>'
        if show_brand_name(brand) else ""
    )
    return (
        f'<div style="{_WRAPPER_STYLE}">'
        f'<div style="{_row_style(theme)}padding-bottom:2.5mm;border-bottom:1px solid #{BORDER_HEX};">'
        f'<div style="display:flex;align-items:center;gap:3mm;">{logo_html}{name_html}</div>'
        f'<div style="text-align:right;line-height:1.35;">{REPORT_TITLE}<br/>'
        f'<span style="font-weight:600;color:#{theme.primary};">{escape(site_name)}</span></div>'
        "</div></div>"
    )


def _footer_template(site_name: str, theme: ReportTheme) -> str:
    return (
        f'<div style="{_WRAPPER_STYLE}">'
        f'<div style="{_row_style(theme)}padding-top:2.5mm;border-top:1px solid #{BORDER_HEX};">'
        f"<span>{escape(site_name)} · Generated {escape(generated_at_label())}</span>"
        '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>'
        "</div></div>"
    )


def render_report_pdf(report: Report) -> bytes:
    html = render_report_html(report, mode="print")
    theme = theme_for(report)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        try:
            page = browser.new_page()
            page.set_content(html, wait_until="load")
            page.emulate_media(media="print")
            # Chromium can't skip the running header/footer on one page, so the cover sheet is
            # printed on its own without them and joined to the rest of the report.
            cover = page.pdf(format="A4", print_background=True, page_ranges="1")
            body = page.pdf(
                format="A4",
                print_background=True,
                page_ranges="2-",
                display_header_footer=True,
                header_template=_header_template(report.site_name, theme),
                footer_template=_footer_template(report.site_name, theme),
                margin=PAGE_MARGINS,
            )
            page.set_content(_watermark_html(theme), wait_until="load")
            watermark = page.pdf(format="A4", print_background=True, margin=NO_MARGINS)
        finally:
            browser.close()
    return _assemble(cover, body, watermark)


def _watermark_html(theme: ReportTheme) -> str:
    name = theme.brand.name
    size = watermark_font_size(name, WATERMARK_WIDTH_MM, WATERMARK_MAX_SIZE_MM)
    return (
        '<html><body style="margin:0">'
        '<div style="display:flex;align-items:center;justify-content:center;'
        'width:210mm;height:296mm;overflow:hidden;">'
        f'<span style="font-family:{escape(theme.font.css_stack)};font-size:{size:.2f}mm;'
        f'font-weight:700;white-space:nowrap;color:#{theme.primary};opacity:{WATERMARK_OPACITY};'
        f'transform:rotate({WATERMARK_ANGLE}deg);">{escape(name)}</span>'
        "</div></body></html>"
    )


def _assemble(cover: bytes, body: bytes, watermark: bytes) -> bytes:
    """The cover followed by the body pages, each stamped with the watermark."""
    stamp = PdfReader(BytesIO(watermark)).pages[0]
    writer = PdfWriter()
    writer.append(BytesIO(cover))
    for body_page in PdfReader(BytesIO(body)).pages:
        writer.add_page(body_page).merge_page(stamp)
    buffer = BytesIO()
    writer.write(buffer)
    return buffer.getvalue()
