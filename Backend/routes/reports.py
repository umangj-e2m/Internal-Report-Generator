from dataclasses import asdict

from fastapi import APIRouter, Depends, Query, Response, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from db import get_db
from models.schemas.requests import CreateReportRequest, UpdateReportStyleRequest
from models.schemas.responses import ReportDetailOut, ReportListOut, StyleOptionsOut
from services.exports.docx_export import render_report_docx
from services.exports.html_export import render_report_html, render_slides_html
from services.exports.pdf_export import render_report_pdf
from services.exports.pptx_export import render_report_pptx
from services.exports.themes import BRANDS, DEFAULT_BRAND, FONTS, PALETTES, SIZES
from services.reports import service as report_service
from services.reports.helpers import to_detail, to_summary
from services.scraper.service import WebsiteScraper, get_scraper
from services.shared.constants import DOCX_MEDIA_TYPE, PDF_MEDIA_TYPE, PPTX_MEDIA_TYPE

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportDetailOut, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: CreateReportRequest,
    db: Session = Depends(get_db),
    scraper: WebsiteScraper = Depends(get_scraper),
) -> ReportDetailOut:
    report = report_service.create_report(db, str(payload.url), scraper)
    return to_detail(report)


@router.get("", response_model=ReportListOut)
def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None, max_length=200),
    db: Session = Depends(get_db),
) -> ReportListOut:
    items, total = report_service.list_reports(db, page, page_size, search)
    return ReportListOut(items=[to_summary(item) for item in items], total=total, page=page, page_size=page_size)


@router.get("/style-options", response_model=StyleOptionsOut)
def get_style_options() -> StyleOptionsOut:
    return StyleOptionsOut(
        palettes=[asdict(palette) for palette in PALETTES.values()],
        fonts=[asdict(font) for font in FONTS.values()],
        sizes=[asdict(size) for size in SIZES.values()],
        brands=[
            {"key": brand.key, "name": brand.name, "logo_file": brand.logo_file, "style": brand.style}
            for brand in BRANDS.values()
        ],
        defaults=BRANDS[DEFAULT_BRAND].style,
    )


@router.get("/{slug}", response_model=ReportDetailOut)
def get_report(slug: str, db: Session = Depends(get_db)) -> ReportDetailOut:
    return to_detail(report_service.get_report(db, slug))


@router.put("/{slug}/style", response_model=ReportDetailOut)
def update_report_style(
    slug: str, payload: UpdateReportStyleRequest, db: Session = Depends(get_db)
) -> ReportDetailOut:
    report = report_service.update_style(
        db, slug, payload.brand, payload.palette, payload.font_family, payload.font_size
    )
    return to_detail(report)


@router.get("/{slug}/html", response_class=HTMLResponse)
def get_report_html(slug: str, db: Session = Depends(get_db)) -> HTMLResponse:
    report = report_service.get_report(db, slug)
    return HTMLResponse(render_report_html(report, mode="web"))


@router.get("/{slug}/pdf")
def get_report_pdf(slug: str, download: bool = False, db: Session = Depends(get_db)) -> Response:
    report = report_service.get_report(db, slug)
    return _file_response(render_report_pdf(report), PDF_MEDIA_TYPE, f"{slug}.pdf", download)


@router.get("/{slug}/docx")
def get_report_docx(slug: str, db: Session = Depends(get_db)) -> Response:
    report = report_service.get_report(db, slug)
    return _file_response(render_report_docx(report), DOCX_MEDIA_TYPE, f"{slug}.docx", download=True)


@router.get("/{slug}/slides", response_class=HTMLResponse)
def get_report_slides(slug: str, db: Session = Depends(get_db)) -> HTMLResponse:
    report = report_service.get_report(db, slug)
    return HTMLResponse(render_slides_html(report))


@router.get("/{slug}/pptx")
def get_report_pptx(slug: str, db: Session = Depends(get_db)) -> Response:
    report = report_service.get_report(db, slug)
    return _file_response(render_report_pptx(report), PPTX_MEDIA_TYPE, f"{slug}.pptx", download=True)


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(slug: str, db: Session = Depends(get_db)) -> Response:
    report_service.delete_report(db, slug)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _file_response(content: bytes, media_type: str, filename: str, download: bool) -> Response:
    disposition = "attachment" if download else "inline"
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'{disposition}; filename="{filename}"'},
    )
