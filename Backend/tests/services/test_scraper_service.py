import pytest

from services.scraper.exceptions import FetchError, InvalidUrlError
from tests.fixtures.sample_site import BASE, make_scraper


def test_scrape_reads_start_page_plus_internal_links_up_to_max_pages():
    result = make_scraper(max_pages=5).scrape(f"{BASE}/")

    assert result.site_name == "Example Co"
    assert result.source_url == f"{BASE}/"
    assert [page.url for page in result.pages] == [
        f"{BASE}/",
        f"{BASE}/about",
        f"{BASE}/services",
        f"{BASE}/blog",
        f"{BASE}/contact",
    ]


def test_scrape_respects_smaller_page_limit():
    result = make_scraper(max_pages=2).scrape(f"{BASE}/")

    assert len(result.pages) == 2


def test_failing_pages_are_skipped_and_next_link_is_used():
    result = make_scraper(failing=(f"{BASE}/about",)).scrape(f"{BASE}/")

    urls = [page.url for page in result.pages]
    assert f"{BASE}/about" not in urls
    assert urls[-1] == f"{BASE}/careers"
    assert len(urls) == 5


def test_duplicate_pages_via_index_file_or_canonical_url_are_skipped():
    pages = {
        f"{BASE}/": (
            '<html><head><title>Home</title></head><body>'
            '<a href="/index.html">Home again</a>'
            '<a href="/print/about">About (print version)</a>'
            '<a href="/about">About</a>'
            "</body></html>"
        ),
        f"{BASE}/index.html": "<html><head><title>Home copy</title></head><body></body></html>",
        f"{BASE}/about": "<html><head><title>About</title></head><body></body></html>",
        f"{BASE}/print/about": (
            '<html><head><title>About print</title>'
            f'<link rel="canonical" href="{BASE}/about"></head><body></body></html>'
        ),
    }

    result = make_scraper(pages=pages).scrape(f"{BASE}/")

    assert [page.title for page in result.pages] == ["Home", "About print"]


def test_unreachable_start_page_raises_fetch_error():
    with pytest.raises(FetchError):
        make_scraper(failing=(f"{BASE}/",)).scrape(f"{BASE}/")


@pytest.mark.parametrize("url", ["example.test", "ftp://example.test/", "https://"])
def test_invalid_url_is_rejected(url):
    with pytest.raises(InvalidUrlError):
        make_scraper().scrape(url)
