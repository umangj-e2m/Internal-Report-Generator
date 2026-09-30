from services.scraper import helpers
from tests.fixtures.sample_site import BASE, HOME_HTML


def test_normalize_url_removes_fragment_trailing_slash_and_host_case():
    assert helpers.normalize_url("HTTPS://Example.TEST/About/#team") == "https://example.test/About"
    assert helpers.normalize_url("https://example.test") == "https://example.test/"


def test_normalize_url_treats_index_files_as_their_folder():
    assert helpers.normalize_url("https://example.test/index.html") == "https://example.test/"
    assert helpers.normalize_url("https://example.test/docs/Index.PHP") == "https://example.test/docs"
    assert helpers.normalize_url("https://example.test/docs/index-guide.html") == (
        "https://example.test/docs/index-guide.html"
    )


def test_internal_links_keep_same_site_html_pages_only_in_page_order():
    soup = helpers.parse_html(HOME_HTML)

    links = helpers.extract_internal_links(soup, f"{BASE}/", helpers.bare_host(BASE))

    assert links == [
        f"{BASE}/about",
        f"{BASE}/services",
        f"{BASE}/blog",
        f"{BASE}/contact",
        f"{BASE}/careers",
    ]


def test_www_prefix_is_treated_as_same_site():
    assert helpers.is_crawlable_link("https://www.example.test/about", "example.test")
    assert not helpers.is_crawlable_link("https://blog.example.test/about", "example.test")


def test_page_details_are_extracted_from_home_page():
    soup = helpers.parse_html(HOME_HTML)
    meta_description = helpers.extract_meta_description(soup)

    assert helpers.extract_site_name(soup, BASE) == "Example Co"
    assert helpers.extract_title(soup, BASE) == "Example Co – Home"
    assert meta_description == "Example Co builds reliable software for growing teams."
    assert [(h.level, h.text) for h in helpers.extract_headings(soup)] == [
        (1, "Welcome to Example Co"),
        (2, "What we do"),
        (2, "Our clients"),
    ]
    assert helpers.count_images(soup) == 2
    assert helpers.count_links(soup) == 9


def test_summary_uses_main_paragraphs_and_skips_scripts_footer_and_short_lines():
    soup = helpers.parse_html(HOME_HTML)

    summary = helpers.extract_summary(soup, None, max_chars=700)

    assert summary.startswith("Example Co designs, builds and maintains")
    assert "cross-functional teams" in summary
    assert "Short line" not in summary
    assert "footer paragraph" not in summary
    assert "tracking" not in summary


def test_summary_is_truncated_to_max_chars():
    soup = helpers.parse_html(HOME_HTML)

    summary = helpers.extract_summary(soup, None, max_chars=80)

    assert len(summary) <= 80
    assert summary.endswith("…")


def test_summary_reads_div_text_when_page_has_no_paragraphs_and_many_articles():
    html = (
        "<html><body>"
        "<div class='alert'>Warning! This is a demo website for web scraping purposes only.</div>"
        "<article><h3>Book one</h3><p>£51.77</p></article>"
        "<article><h3>Book two</h3><p>£53.74</p></article>"
        "</body></html>"
    )

    summary = helpers.extract_summary(helpers.parse_html(html), None, max_chars=700)

    assert summary == "Warning! This is a demo website for web scraping purposes only."


def test_summary_falls_back_to_meta_description_then_placeholder():
    soup = helpers.parse_html("<html><body><main><p>Too short.</p></main></body></html>")

    assert helpers.extract_summary(soup, "Meta text", max_chars=700) == "Meta text"
    assert helpers.extract_summary(soup, None, max_chars=700) == helpers.NO_CONTENT_SUMMARY


def test_site_name_falls_back_to_host_without_www():
    soup = helpers.parse_html("<html><head><title>x</title></head><body></body></html>")

    assert helpers.extract_site_name(soup, "https://www.sample.test/page") == "sample.test"
