from html import escape

from playwright.sync_api import sync_playwright

from config import get_settings
from models.db import Report
from services.exports.helpers import generated_at_label, logo_data_uri
from services.exports.html_export import render_report_html
from services.shared.constants import BRAND_MUTED_HEX, BRAND_PRIMARY_HEX, REPORT_TITLE

PAGE_MARGINS = {"top": "26mm", "bottom": "20mm", "left": "16mm", "right": "16mm"}

# Chromium renders header/footer templates in isolation: styles must be inline and
# font-size must be set explicitly, otherwise the text is invisible.
_WRAPPER_STYLE = "width:100%;padding:0 16mm;box-sizing:border-box;-webkit-print-color-adjust:exact;"
_ROW_STYLE = (
    "display:flex;align-items:center;justify-content:space-between;"
    f"font-family:'Segoe UI',Arial,sans-serif;font-size:8pt;color:#{BRAND_MUTED_HEX};"
)


def _header_template(site_name: str) -> str:
    logo = logo_data_uri()
    logo_html = f'<img src="{logo}" style="height:9mm;width:9mm;" />' if logo else ""
    brand = escape(get_settings().report_brand_name)
    return (
        f'<div style="{_WRAPPER_STYLE}">'
        f'<div style="{_ROW_STYLE}padding-bottom:2.5mm;border-bottom:1px solid #E5E7EB;">'
        f'<div style="display:flex;align-items:center;gap:3mm;">{logo_html}'
        f'<span style="font-size:10pt;font-weight:700;color:#{BRAND_PRIMARY_HEX};">{brand}</span></div>'
        f'<div style="text-align:right;line-height:1.35;">{REPORT_TITLE}<br/>'
        f'<span style="font-weight:600;color:#{BRAND_PRIMARY_HEX};">{escape(site_name)}</span></div>'
        "</div></div>"
    )


def _footer_template(site_name: str) -> str:
    return (
        f'<div style="{_WRAPPER_STYLE}">'
        f'<div style="{_ROW_STYLE}padding-top:2.5mm;border-top:1px solid #E5E7EB;">'
        f"<span>{escape(site_name)} · Generated {escape(generated_at_label())}</span>"
        '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>'
        "</div></div>"
    )


def render_report_pdf(report: Report) -> bytes:
    html = render_report_html(report, mode="print")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        try:
            page = browser.new_page()
            page.set_content(html, wait_until="load")
            page.emulate_media(media="print")
            return page.pdf(
                format="A4",
                print_background=True,
                display_header_footer=True,
                header_template=_header_template(report.site_name),
                footer_template=_footer_template(report.site_name),
                margin=PAGE_MARGINS,
            )
        finally:
            browser.close()
