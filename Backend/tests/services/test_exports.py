from io import BytesIO

from docx import Document

from services.exports.charts import build_charts, build_page_chart
from services.exports.docx_export import render_report_docx
from services.exports.html_export import render_report_html


def test_web_html_contains_header_summary_table_and_page_sections(sample_report):
    html = render_report_html(sample_report, mode="web")

    assert 'class="web-header"' in html
    assert "data:image/png;base64," in html
    assert "Pricing" in html
    assert "https://sample.test/pricing" in html
    assert "1,500" in html  # total words in the summary table
    assert "This page does not provide a meta description." in html
    assert "http://frontend.test/r/sample-site-abc123" in html


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

    assert build_page_chart(page, "png") is None
    assert build_page_chart(sample_report.pages[1], "png").title == "Content breakdown"


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
