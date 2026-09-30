from io import BytesIO

from docx import Document
from docx.document import Document as DocxDocument
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.section import Section
from docx.shared import Emu, Mm, Pt, RGBColor
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph

from config import get_settings
from models.db import Report, ReportPage
from services.exports.helpers import compute_totals, generated_at_label, logo_path, page_description
from services.reports.helpers import share_url
from services.shared.constants import (
    BRAND_ACCENT_HEX,
    BRAND_MUTED_HEX,
    BRAND_PRIMARY_HEX,
    REPORT_TITLE,
)
from utils.dates import format_display

PRIMARY = RGBColor.from_string(BRAND_PRIMARY_HEX)
ACCENT = RGBColor.from_string(BRAND_ACCENT_HEX)
MUTED = RGBColor.from_string(BRAND_MUTED_HEX)
WHITE = RGBColor.from_string("FFFFFF")
BORDER_HEX = "E5E7EB"
SURFACE_HEX = "F7F8FB"
SURFACE_STRONG_HEX = "EEF0F6"

PAGE_WIDTH = Mm(210)
PAGE_HEIGHT = Mm(297)
SIDE_MARGIN = Mm(16)
CONTENT_WIDTH = Emu(PAGE_WIDTH - 2 * SIDE_MARGIN)
SUMMARY_COLUMN_WIDTHS = (Mm(9), Mm(54), Mm(70), Mm(15), Mm(13), Mm(17))

# OOXML requires child elements in schema order; these are the siblings that must come after.
_PPR_AFTER_PBDR = (
    "w:shd", "w:tabs", "w:suppressAutoHyphens", "w:kinsoku", "w:wordWrap", "w:overflowPunct",
    "w:topLinePunct", "w:autoSpaceDE", "w:autoSpaceDN", "w:bidi", "w:adjustRightInd",
    "w:snapToGrid", "w:spacing", "w:ind", "w:contextualSpacing", "w:mirrorIndents",
    "w:suppressOverlap", "w:jc", "w:textDirection", "w:textAlignment", "w:textboxTightWrap",
    "w:outlineLvl", "w:divId", "w:cnfStyle", "w:rPr", "w:sectPr", "w:pPrChange",
)
_PPR_AFTER_SHD = _PPR_AFTER_PBDR[1:]
_TCPR_AFTER_BORDERS = (
    "w:shd", "w:noWrap", "w:tcMar", "w:textDirection", "w:tcFitText", "w:vAlign", "w:hideMark",
    "w:headers", "w:cellIns", "w:cellDel", "w:cellMerge", "w:tcPrChange",
)
_TCPR_AFTER_SHD = _TCPR_AFTER_BORDERS[1:]
_TBLPR_AFTER_BORDERS = ("w:shd", "w:tblLayout", "w:tblCellMar", "w:tblLook", "w:tblCaption",
                        "w:tblDescription", "w:tblPrChange")
_TBLPR_AFTER_CELL_MARGINS = ("w:tblLook", "w:tblCaption", "w:tblDescription", "w:tblPrChange")


def render_report_docx(report: Report) -> bytes:
    doc = Document()
    _setup_styles(doc)

    section = doc.sections[0]
    _setup_page(section)
    _build_header(section, report.site_name)
    _build_footer(section, report.site_name)

    _build_cover(doc, report)
    _build_summary(doc, report)
    for page in report.pages:
        _build_page_section(doc, page)

    buffer = BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


# ---------- Layout ----------
def _setup_page(section: Section) -> None:
    section.page_width = PAGE_WIDTH
    section.page_height = PAGE_HEIGHT
    section.top_margin = Mm(26)
    section.bottom_margin = Mm(20)
    section.left_margin = SIDE_MARGIN
    section.right_margin = SIDE_MARGIN
    section.header_distance = Mm(8)
    section.footer_distance = Mm(8)


def _setup_styles(doc: DocxDocument) -> None:
    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = RGBColor.from_string("1F2937")
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.15

    heading1 = doc.styles["Heading 1"]
    heading1.font.name = "Calibri"
    heading1.font.size = Pt(15)
    heading1.font.bold = True
    heading1.font.color.rgb = PRIMARY
    heading1.paragraph_format.space_before = Pt(0)
    heading1.paragraph_format.space_after = Pt(6)

    heading2 = doc.styles["Heading 2"]
    heading2.font.name = "Calibri"
    heading2.font.size = Pt(11.5)
    heading2.font.bold = True
    heading2.font.color.rgb = PRIMARY
    heading2.paragraph_format.space_before = Pt(12)
    heading2.paragraph_format.space_after = Pt(4)


def _build_header(section: Section, site_name: str) -> None:
    paragraph = section.header.paragraphs[0]
    # The built-in "Header"/"Footer" styles carry a centre tab stop that would catch the first tab.
    paragraph.style = "Normal"
    paragraph.paragraph_format.tab_stops.add_tab_stop(CONTENT_WIDTH, WD_TAB_ALIGNMENT.RIGHT)
    paragraph.paragraph_format.space_after = Pt(0)

    logo = logo_path()
    if logo:
        paragraph.add_run().add_picture(str(logo), height=Mm(9))
    _run(paragraph, f"  {get_settings().report_brand_name}", size=10, bold=True, color=PRIMARY)
    _run(paragraph, f"\t{REPORT_TITLE} · ", size=8, color=MUTED)
    _run(paragraph, site_name, size=8, bold=True, color=PRIMARY)
    _set_paragraph_border(paragraph, "bottom")


def _build_footer(section: Section, site_name: str) -> None:
    paragraph = section.footer.paragraphs[0]
    paragraph.style = "Normal"
    paragraph.paragraph_format.space_after = Pt(0)
    paragraph.paragraph_format.tab_stops.add_tab_stop(CONTENT_WIDTH, WD_TAB_ALIGNMENT.RIGHT)
    _set_paragraph_border(paragraph, "top")

    _run(paragraph, f"{site_name} · Generated {generated_at_label()}\tPage ", size=8, color=MUTED)
    _add_field(paragraph, "PAGE")
    _run(paragraph, " of ", size=8, color=MUTED)
    _add_field(paragraph, "NUMPAGES")


# ---------- Content ----------
def _build_cover(doc: DocxDocument, report: Report) -> None:
    settings = get_settings()
    totals = compute_totals(report)

    eyebrow = doc.add_paragraph()
    eyebrow.paragraph_format.space_after = Pt(2)
    _run(eyebrow, REPORT_TITLE.upper(), size=8.5, bold=True, color=ACCENT)

    title = doc.add_paragraph()
    title.paragraph_format.space_after = Pt(2)
    _run(title, report.site_name, size=24, bold=True, color=PRIMARY)

    url = doc.add_paragraph()
    url.paragraph_format.space_after = Pt(12)
    _run(url, report.source_url, size=10, color=MUTED)

    metrics = [
        ("Pages analysed", f"{report.page_count}"),
        ("Total words", f"{totals.words:,}"),
        ("Total links", f"{totals.links:,}"),
        ("Total images", f"{totals.images:,}"),
    ]
    table = _new_table(doc, rows=1, cols=len(metrics))
    for cell, (label, value) in zip(table.rows[0].cells, metrics):
        _shade(cell, SURFACE_HEX)
        _set_cell_border(cell, "top", BRAND_ACCENT_HEX, size=18)
        label_paragraph = cell.paragraphs[0]
        label_paragraph.paragraph_format.space_after = Pt(0)
        _run(label_paragraph, label.upper(), size=7.5, color=MUTED)
        value_paragraph = cell.add_paragraph()
        value_paragraph.paragraph_format.space_after = Pt(2)
        _run(value_paragraph, value, size=16, bold=True, color=PRIMARY)

    _spacer(doc)
    details = [
        ("Website read on", format_display(report.created_at, settings.report_timezone)),
        ("Report generated", generated_at_label()),
        ("Shareable link", share_url(report.slug)),
    ]
    details_table = _new_table(doc, rows=len(details), cols=2, borders=False)
    _set_column_widths(details_table, (Mm(40), Emu(CONTENT_WIDTH - Mm(40))))
    for row, (label, value) in zip(details_table.rows, details):
        for cell in row.cells:
            _shade(cell, SURFACE_HEX)
        _run(row.cells[0].paragraphs[0], label, size=9.5, bold=True, color=MUTED)
        _run(row.cells[1].paragraphs[0], value, size=9.5)
    _spacer(doc)


def _build_summary(doc: DocxDocument, report: Report) -> None:
    totals = compute_totals(report)
    heading = doc.add_heading("Summary", level=1)
    _set_paragraph_border(heading, "bottom", BRAND_ACCENT_HEX, size=12)

    plural = "s" if report.page_count != 1 else ""
    lead = doc.add_paragraph()
    _run(
        lead,
        f"Overview of the {report.page_count} page{plural} read from this website. "
        "Each page is described in detail in the sections that follow.",
        color=MUTED,
    )

    headers = ("#", "Page", "Description", "Words", "Links", "Images")
    table = _new_table(doc, rows=1, cols=len(headers))
    header_row = table.rows[0]
    _repeat_as_header(header_row)
    for index, (cell, text) in enumerate(zip(header_row.cells, headers)):
        _shade(cell, BRAND_PRIMARY_HEX)
        _run(cell.paragraphs[0], text, size=9, bold=True, color=WHITE)
        _align_numeric(cell, index)

    for row_index, page in enumerate(report.pages):
        cells = table.add_row().cells
        _keep_row_together(table.rows[-1])
        values = (
            str(page.position),
            None,
            page_description(page),
            f"{page.word_count:,}",
            f"{page.link_count:,}",
            f"{page.image_count:,}",
        )
        for index, (cell, value) in enumerate(zip(cells, values)):
            if row_index % 2 == 1:
                _shade(cell, SURFACE_HEX)
            if value is not None:
                _run(cell.paragraphs[0], value, size=9)
            _align_numeric(cell, index)
        page_cell = cells[1].paragraphs[0]
        page_cell.paragraph_format.space_after = Pt(0)
        _run(page_cell, page.title, size=9, bold=True, color=PRIMARY)
        _run(cells[1].add_paragraph(), page.url, size=7.5, color=MUTED)

    total_cells = table.add_row().cells
    merged = total_cells[0].merge(total_cells[2])
    _run(merged.paragraphs[0], "Total", size=9, bold=True, color=PRIMARY)
    for index, value in ((3, totals.words), (4, totals.links), (5, totals.images)):
        _run(total_cells[index].paragraphs[0], f"{value:,}", size=9, bold=True, color=PRIMARY)
        _align_numeric(total_cells[index], index)
    for cell in table.rows[-1].cells:
        _shade(cell, SURFACE_STRONG_HEX)

    _set_column_widths(table, SUMMARY_COLUMN_WIDTHS, skip_last_row=True)
    merged.width = Emu(sum(SUMMARY_COLUMN_WIDTHS[:3]))
    for index in (3, 4, 5):
        total_cells[index].width = SUMMARY_COLUMN_WIDTHS[index]


def _build_page_section(doc: DocxDocument, page: ReportPage) -> None:
    settings = get_settings()
    heading = doc.add_heading(level=1)
    _run(heading, f"{page.position:02d}  ", size=15, bold=True, color=ACCENT)
    _run(heading, page.title, size=15, bold=True, color=PRIMARY)
    heading.paragraph_format.page_break_before = True
    heading.paragraph_format.space_after = Pt(2)

    url = doc.add_paragraph()
    _set_paragraph_border(url, "bottom", BRAND_ACCENT_HEX, size=12)
    url.paragraph_format.space_after = Pt(10)
    _run(url, page.url, size=9, color=MUTED)

    stats = (
        ("Words", f"{page.word_count:,}"),
        ("Links", f"{page.link_count:,}"),
        ("Images", f"{page.image_count:,}"),
        ("Read on", format_display(page.fetched_at, settings.report_timezone)),
    )
    table = _new_table(doc, rows=2, cols=len(stats))
    for cell, (label, _) in zip(table.rows[0].cells, stats):
        _shade(cell, SURFACE_STRONG_HEX)
        _run(cell.paragraphs[0], label.upper(), size=7.5, bold=True, color=MUTED)
    for cell, (_, value) in zip(table.rows[1].cells, stats):
        _run(cell.paragraphs[0], value, size=10.5, bold=True, color=PRIMARY)

    doc.add_heading("Meta description", level=2)
    if page.meta_description:
        doc.add_paragraph(page.meta_description)
    else:
        _run(doc.add_paragraph(), "This page does not provide a meta description.", italic=True, color=MUTED)

    doc.add_heading("Key headings", level=2)
    if page.headings:
        for item in page.headings:
            level = int(item.get("level", 1))
            bullet = doc.add_paragraph(style="List Bullet" if level == 1 else "List Bullet 2")
            bullet.paragraph_format.space_after = Pt(2)
            _run(bullet, f"H{level}  ", size=8, bold=True, color=ACCENT if level == 1 else MUTED)
            _run(bullet, item.get("text", ""))
    else:
        _run(doc.add_paragraph(), "No H1 or H2 headings were found on this page.", italic=True, color=MUTED)

    doc.add_heading("Content summary", level=2)
    summary = doc.add_paragraph(page.summary)
    summary.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    _set_paragraph_border(summary, "left", BRAND_ACCENT_HEX, size=18, space=8)
    _shade_paragraph(summary, SURFACE_HEX)


# ---------- Low-level helpers ----------
def _run(paragraph: Paragraph, text: str, size: float | None = None, bold: bool = False,
         italic: bool = False, color: RGBColor | None = None):
    run = paragraph.add_run(text)
    if size:
        run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    if color is not None:
        run.font.color.rgb = color
    return run


def _spacer(doc: DocxDocument) -> None:
    doc.add_paragraph().paragraph_format.space_after = Pt(4)


def _new_table(doc: DocxDocument, rows: int, cols: int, borders: bool = True) -> Table:
    table = doc.add_table(rows=rows, cols=cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    _set_table_borders(table, BORDER_HEX if borders else None)
    _set_column_widths(table, [Emu(CONTENT_WIDTH // cols)] * cols)
    return table


def _set_table_borders(table: Table, color: str | None) -> None:
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = OxmlElement(f"w:{edge}")
        if color and edge not in ("left", "right", "insideV"):
            element.set(qn("w:val"), "single")
            element.set(qn("w:sz"), "4")
            element.set(qn("w:color"), color)
        else:
            element.set(qn("w:val"), "nil")
        borders.append(element)
    tbl_pr.insert_element_before(borders, *_TBLPR_AFTER_BORDERS)

    margins = OxmlElement("w:tblCellMar")
    for edge, value in (("top", 70), ("bottom", 70), ("left", 110), ("right", 110)):
        element = OxmlElement(f"w:{edge}")
        element.set(qn("w:w"), str(value))
        element.set(qn("w:type"), "dxa")
        margins.append(element)
    tbl_pr.insert_element_before(margins, *_TBLPR_AFTER_CELL_MARGINS)


def _set_cell_border(cell: _Cell, edge: str, color: str, size: int = 4) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.find(qn("w:tcBorders"))
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.insert_element_before(borders, *_TCPR_AFTER_BORDERS)
    element = OxmlElement(f"w:{edge}")
    element.set(qn("w:val"), "single")
    element.set(qn("w:sz"), str(size))
    element.set(qn("w:color"), color)
    borders.append(element)


def _shading(fill: str):
    shading = OxmlElement("w:shd")
    shading.set(qn("w:val"), "clear")
    shading.set(qn("w:color"), "auto")
    shading.set(qn("w:fill"), fill)
    return shading


def _shade(cell: _Cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    existing = tc_pr.find(qn("w:shd"))
    if existing is not None:
        tc_pr.remove(existing)
    tc_pr.insert_element_before(_shading(fill), *_TCPR_AFTER_SHD)


def _shade_paragraph(paragraph: Paragraph, fill: str) -> None:
    paragraph._p.get_or_add_pPr().insert_element_before(_shading(fill), *_PPR_AFTER_SHD)


def _set_column_widths(table: Table, widths, skip_last_row: bool = False) -> None:
    """Word lays out by the table grid (gridCol), so set it as well as every cell's width."""
    for column, width in zip(table.columns, widths):
        column.width = width
    rows = table.rows[:-1] if skip_last_row else table.rows
    for row in rows:
        for cell, width in zip(row.cells, widths):
            cell.width = width


def _align_numeric(cell: _Cell, column_index: int) -> None:
    if column_index == 0:
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif column_index >= 3:
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT


def _repeat_as_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    element = OxmlElement("w:tblHeader")
    element.set(qn("w:val"), "true")
    tr_pr.append(element)


def _keep_row_together(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    element = OxmlElement("w:cantSplit")
    element.set(qn("w:val"), "true")
    tr_pr.append(element)


def _set_paragraph_border(paragraph: Paragraph, edge: str, color: str = BORDER_HEX,
                          size: int = 6, space: int = 4) -> None:
    p_pr = paragraph._p.get_or_add_pPr()
    borders = p_pr.find(qn("w:pBdr"))
    if borders is None:
        borders = OxmlElement("w:pBdr")
        p_pr.insert_element_before(borders, *_PPR_AFTER_PBDR)
    element = OxmlElement(f"w:{edge}")
    element.set(qn("w:val"), "single")
    element.set(qn("w:sz"), str(size))
    element.set(qn("w:space"), str(space))
    element.set(qn("w:color"), color)
    borders.append(element)


def _add_field(paragraph: Paragraph, instruction: str) -> None:
    """Insert a Word field (e.g. PAGE, NUMPAGES) that Word evaluates when the document opens."""
    def fld_char(kind: str):
        element = OxmlElement("w:fldChar")
        element.set(qn("w:fldCharType"), kind)
        return element

    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = instruction

    for part in (fld_char("begin"), instr, fld_char("separate")):
        run = _run(paragraph, "", size=8, color=MUTED)
        run._r.append(part)
    _run(paragraph, "1", size=8, color=MUTED)
    _run(paragraph, "", size=8, color=MUTED)._r.append(fld_char("end"))
