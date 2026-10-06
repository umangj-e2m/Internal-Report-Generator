from io import BytesIO

from docx import Document
from pptx import Presentation
from pypdf import PdfReader

from services.exports.charts import build_charts, build_page_chart
from services.exports.docx_export import render_report_docx
from services.exports.html_export import render_report_html, render_slides_html
from services.exports.pdf_export import render_report_pdf
from services.exports.pptx_export import render_report_pptx
from config import get_settings
from services.exports.slide_layout import fit_logo
from services.exports.themes import BRANDS, DEFAULT_BRAND, DEFAULT_THEME, FONTS, PALETTES, SIZES

DEFAULT_BRAND_NAME = BRANDS[DEFAULT_BRAND].name


def test_every_brand_has_a_logo_file_and_known_style_choices():
    for brand in BRANDS.values():
        assert (get_settings().report_logo_dir / brand.logo_file).is_file()
        assert brand.palette in PALETTES
        assert brand.font_family in FONTS
        assert brand.font_size in SIZES


def test_fit_logo_keeps_the_logo_proportions_inside_its_box():
    box = (1.0, 1.0, 3.0, 1.0)

    assert fit_logo(box, 1.0) == (1.0, 1.0, 1.0, 1.0)
    assert fit_logo(box, 6.0) == (1.0, 1.25, 3.0, 0.5)
    assert fit_logo(box, 1.0, align="center") == (2.0, 1.0, 1.0, 1.0)
    assert fit_logo(box, 2.0, scale=0.5) == (1.0, 1.25, 1.0, 0.5)


def _use_explore_brand(report) -> None:
    report.brand = "explore"


def test_html_and_slides_show_the_brand_logo_without_repeating_its_wordmark(sample_report):
    _use_explore_brand(sample_report)
    html = render_report_html(sample_report, mode="web")
    slides = render_slides_html(sample_report)

    assert 'alt="Explore Media logo"' in html and 'alt="Explore Media logo"' in slides
    header = html.split('class="web-header"')[1].split("</header>")[0]
    assert "<span>Explore Media</span>" not in header
    assert "<span>Explore Media</span>" in html.split('class="web-footer"')[1]
    assert "E2M Solutions" not in html and "E2M Solutions" not in slides


def test_docx_and_pptx_use_the_brand_logo_and_name(sample_report):
    _use_explore_brand(sample_report)
    document = Document(BytesIO(render_report_docx(sample_report)))
    presentation = Presentation(BytesIO(render_report_pptx(sample_report)))
    header_text = "".join(document.sections[0].header.tables[0]._element.itertext())
    slide_texts = [shape.text_frame.text for slide in presentation.slides
                   for shape in slide.shapes if shape.has_text_frame]

    assert "pic:pic" in document.sections[0].header._element.xml
    assert "Explore Media" not in header_text and "E2M Solutions" not in header_text
    assert any("Explore Media" in text for text in slide_texts)
    assert not any("E2M Solutions" in text for text in slide_texts)


def test_web_html_contains_header_summary_table_and_page_sections(sample_report):
    html = render_report_html(sample_report, mode="web")

    assert 'class="web-header"' in html
    assert "data:image/png;base64," in html
    assert "Pricing" in html
    assert "https://sample.test/pricing" in html
    assert "1,500" in html  # total words in the summary table
    assert "This page does not provide a meta description." in html
    assert "http://frontend.test/api/reports/sample-site-abc123/html" in html


def test_html_and_slides_open_links_in_a_new_tab(sample_report):
    for html in (render_report_html(sample_report), render_slides_html(sample_report)):
        assert '<base target="_blank" />' in html


def test_html_escapes_scraped_content(sample_report):
    html = render_report_html(sample_report, mode="web")

    assert "<script>alert(1)</script>" not in html
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in html
    assert "Sample &lt;Site&gt;" in html


def test_print_html_leaves_header_and_footer_to_pdf_renderer(sample_report):
    html = render_report_html(sample_report, mode="print")

    assert 'class="web-header"' not in html
    assert 'class="web-footer"' not in html
    assert 'class="mode-print"' in html


def test_html_opens_with_a_cover_page_in_both_modes(sample_report):
    for mode in ("web", "print"):
        html = render_report_html(sample_report, mode=mode)
        cover = html.split('class="cover-page"')[1].split("</section>")[0]

        assert html.index('class="cover-page"') < html.index('class="overview"')
        assert "Website Content Report" in cover
        assert "Sample &lt;Site&gt;" in cover
        assert "https://sample.test/" in cover
        assert "2 pages analysed" in cover
        assert DEFAULT_BRAND_NAME in cover


def test_pdf_cover_page_has_no_running_header_or_footer(sample_report):
    reader = PdfReader(BytesIO(render_report_pdf(sample_report)))
    cover_text = reader.pages[0].extract_text()
    second_page_text = reader.pages[1].extract_text()

    assert "Website read on" in cover_text
    assert "Page " not in cover_text
    assert "Overview" in second_page_text and "Page 2 of" in second_page_text


def test_docx_opens_with_a_cover_page_without_the_running_header(sample_report):
    document = Document(BytesIO(render_report_docx(sample_report)))
    section = document.sections[0]
    texts = [paragraph.text for paragraph in document.paragraphs]
    overview = next(p for p in document.paragraphs if p.text == "Overview")

    assert section.different_first_page_header_footer
    assert DEFAULT_BRAND_NAME in section.first_page_footer.paragraphs[0].text
    assert texts.index("WEBSITE CONTENT REPORT") < texts.index("Overview")
    assert "Sample <Site>" in texts
    assert overview.paragraph_format.page_break_before


def test_every_format_has_the_company_watermark_except_the_cover(sample_report):
    _use_explore_brand(sample_report)
    html = render_report_html(sample_report, mode="web")
    slides = render_slides_html(sample_report)
    reader = PdfReader(BytesIO(render_report_pdf(sample_report)))
    document = Document(BytesIO(render_report_docx(sample_report)))
    presentation = Presentation(BytesIO(render_report_pptx(sample_report)))
    section = document.sections[0]
    pptx_watermarks = [any(shape.has_text_frame and shape.text_frame.text == "Explore Media"
                           and shape.rotation for shape in slide.shapes)
                       for slide in presentation.slides]

    assert "--watermark: url('data:image/svg+xml" in html
    assert slides.count('class="el watermark"') == slides.count('class="slide ') - 2
    assert reader.pages[0].extract_text().count("Explore Media") == 1  # cover footer only
    # Rotated text is extracted in pieces, so whitespace is ignored.
    assert all("ExploreMedia" in "".join(page.extract_text().split()) for page in reader.pages[1:])
    assert "Watermark" in section.header._element.xml
    assert "Watermark" not in section.first_page_header._element.xml
    assert pptx_watermarks == [False] + [True] * (len(presentation.slides) - 2) + [False]


def test_docx_has_logo_header_page_number_footer_and_repeating_table_header(sample_report):
    document = Document(BytesIO(render_report_docx(sample_report)))
    section = document.sections[0]

    header_xml = section.header._element.xml
    footer_xml = section.footer._element.xml
    body_xml = document.element.body.xml
    body_text = "".join(document.element.body.itertext())
    header_text = "".join(section.header._element.itertext())

    assert "pic:pic" in header_xml
    assert "Sample <Site>" in header_text
    assert "NUMPAGES" in footer_xml and "PAGE" in footer_xml
    assert "w:tblHeader" in body_xml
    assert "Home <script>alert(1)</script>" in body_text
    assert "Pricing" in body_text
    assert "This page does not provide a meta description." in body_text

    summary_table = document.tables[1]
    assert [cell.text for cell in summary_table.rows[0].cells] == [
        "#", "Page", "Description", "Words", "Links", "Images",
    ]
    assert len(summary_table.rows) == 1 + sample_report.page_count + 1


def test_report_charts_are_bar_and_line_in_both_formats(sample_report):
    for fmt, signature in (("svg", b"<svg"), ("png", b"\x89PNG")):
        charts = build_charts(sample_report, fmt)
        assert [chart.title for chart in charts] == ["Words per page", "Links and images by page"]
        assert all(signature in chart.image[:200] for chart in charts)


def test_words_pie_chart_is_skipped_when_no_page_has_words(sample_report):
    for page in sample_report.pages:
        page.word_count = 0

    titles = [chart.title for chart in build_charts(sample_report, "png")]

    assert titles == ["Links and images by page"]


def test_page_bar_chart_is_skipped_for_an_empty_page(sample_report):
    page = sample_report.pages[0]
    page.word_count = page.link_count = page.image_count = 0

    assert build_page_chart(page, "png", DEFAULT_THEME) is None
    assert build_page_chart(sample_report.pages[1], "png", DEFAULT_THEME).title == "Content breakdown"


def _use_ocean_georgia_large(report) -> None:
    report.palette, report.font_family, report.font_size = "ocean", "georgia", "large"


def test_html_and_slides_use_the_report_style(sample_report):
    _use_ocean_georgia_large(sample_report)
    ocean = PALETTES["ocean"]

    for html in (render_report_html(sample_report), render_slides_html(sample_report)):
        assert f"--primary: #{ocean.primary};" in html
        assert f"--accent: #{ocean.accent};" in html
        assert "--font-family: Georgia, 'Times New Roman', Times, serif;" in html
        assert "--font-scale: 1.1;" in html


def test_docx_uses_the_report_style(sample_report):
    _use_ocean_georgia_large(sample_report)

    document = Document(BytesIO(render_report_docx(sample_report)))
    normal = document.styles["Normal"]

    assert normal.font.name == "Georgia"
    assert normal.font.size.pt == 11.5
    assert str(document.styles["Heading 1"].font.color.rgb) == PALETTES["ocean"].primary


def test_pptx_uses_the_report_style(sample_report):
    _use_ocean_georgia_large(sample_report)

    presentation = Presentation(BytesIO(render_report_pptx(sample_report)))
    runs = [run for shape in presentation.slides[0].shapes if shape.has_text_frame
            for paragraph in shape.text_frame.paragraphs for run in paragraph.runs]
    site_title = next(run for run in runs if run.text == sample_report.site_name)

    assert {run.font.name for run in runs} == {"Georgia"}
    assert site_title.font.size.pt == 48.5
    assert str(site_title.font.color.rgb) == PALETTES["ocean"].primary


def test_charts_appear_in_html_and_docx(sample_report):
    html = render_report_html(sample_report, mode="print")
    document = Document(BytesIO(render_report_docx(sample_report)))
    body_text = "".join(document.element.body.itertext())
    expected_images = 2 + sample_report.page_count

    assert 'class="charts"' in html
    assert html.count("data:image/svg+xml;base64,") == expected_images
    breakdown_headings = [p for p in document.paragraphs if p.text == "Content breakdown"]
    assert len(breakdown_headings) == sample_report.page_count
    assert "Words per page" in body_text and "Links and images by page" in body_text
    assert len(document.inline_shapes) >= expected_images
