from io import BytesIO

from docx import Document

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
    body_text = "\n".join(paragraph.text for paragraph in document.paragraphs)

    assert "pic:pic" in header_xml
    assert "Sample <Site>" in section.header.paragraphs[0].text
    assert "NUMPAGES" in footer_xml and "PAGE" in footer_xml
    assert "w:tblHeader" in body_xml
    assert "Home <script>alert(1)</script>" in body_text
    assert "Pricing" in body_text
    assert "This page does not provide a meta description." in body_text

    summary_table = document.tables[2]
    assert [cell.text for cell in summary_table.rows[0].cells] == [
        "#", "Page", "Description", "Words", "Links", "Images",
    ]
    assert len(summary_table.rows) == 1 + sample_report.page_count + 1
