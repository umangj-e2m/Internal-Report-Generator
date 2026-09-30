import logging
from contextlib import AbstractContextManager, nullcontext
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

from config import Settings, get_settings
from models.domain.scraped_page import ScrapedPage, ScrapeResult
from services.scraper import helpers
from services.scraper.exceptions import FetchError, InvalidUrlError
from utils.dates import utcnow

logger = logging.getLogger(__name__)

EXTRA_ATTEMPTS_PER_PAGE = 3


@dataclass
class _FetchedPage:
    url: str
    soup: BeautifulSoup


class WebsiteScraper:
    """Reads the start URL plus internal links on the same site, up to `scraper_max_pages` pages."""

    def __init__(self, settings: Settings | None = None, client: httpx.Client | None = None):
        self.settings = settings or get_settings()
        self._client = client

    def scrape(self, url: str) -> ScrapeResult:
        self._validate(url)
        with self._client_context() as client:
            start = self._fetch(client, url)
            if start is None:
                raise FetchError(f"Could not read {url}. Check the URL and that the site is reachable.")

            site_host = helpers.bare_host(start.url)
            result = ScrapeResult(
                source_url=start.url,
                site_name=helpers.extract_site_name(start.soup, start.url),
            )
            result.pages.append(self._build_page(start))

            visited = {helpers.normalize_url(url), *self._page_keys(start)}
            queue = helpers.extract_internal_links(start.soup, start.url, site_host)
            attempts_left = self.settings.scraper_max_pages * EXTRA_ATTEMPTS_PER_PAGE

            while queue and len(result.pages) < self.settings.scraper_max_pages and attempts_left > 0:
                link = queue.pop(0)
                link_key = helpers.normalize_url(link)
                if link_key in visited:
                    continue
                visited.add(link_key)
                attempts_left -= 1

                page = self._fetch(client, link)
                if page is None or helpers.bare_host(page.url) != site_host:
                    continue
                page_keys = self._page_keys(page) - {link_key}
                if page_keys & visited:
                    continue
                visited |= page_keys
                result.pages.append(self._build_page(page))

        logger.info("Scraped %s page(s) from %s", len(result.pages), result.source_url)
        return result

    @staticmethod
    def _page_keys(page: _FetchedPage) -> set[str]:
        """Keys a fetched page is known by: its final URL after redirects and its canonical URL."""
        keys = {helpers.normalize_url(page.url)}
        canonical = helpers.extract_canonical_url(page.soup, page.url)
        if canonical:
            keys.add(canonical)
        return keys

    def _validate(self, url: str) -> None:
        parts = urlparse(url)
        if parts.scheme not in ("http", "https") or not parts.netloc:
            raise InvalidUrlError("Enter a full website URL starting with http:// or https://")

    def _client_context(self) -> AbstractContextManager[httpx.Client]:
        if self._client is not None:
            return nullcontext(self._client)
        return httpx.Client(
            follow_redirects=True,
            timeout=self.settings.scraper_timeout_seconds,
            headers={"User-Agent": self.settings.scraper_user_agent, "Accept": "text/html,*/*;q=0.8"},
        )

    def _fetch(self, client: httpx.Client, url: str) -> _FetchedPage | None:
        try:
            response = client.get(url)
        except httpx.HTTPError as exc:
            logger.warning("Failed to fetch %s: %s", url, exc)
            return None

        content_type = response.headers.get("content-type", "")
        if response.status_code >= 400:
            logger.warning("Skipping %s: HTTP %s", url, response.status_code)
            return None
        if "html" not in content_type:
            logger.info("Skipping %s: not HTML (%s)", url, content_type)
            return None
        if len(response.content) > self.settings.scraper_max_bytes:
            logger.info("Skipping %s: page larger than %s bytes", url, self.settings.scraper_max_bytes)
            return None

        return _FetchedPage(url=str(response.url), soup=helpers.parse_html(response.text))

    def _build_page(self, page: _FetchedPage) -> ScrapedPage:
        soup = page.soup
        meta_description = helpers.extract_meta_description(soup)
        return ScrapedPage(
            url=page.url,
            title=helpers.extract_title(soup, page.url),
            meta_description=meta_description,
            headings=helpers.extract_headings(soup),
            summary=helpers.extract_summary(soup, meta_description, self.settings.summary_max_chars),
            word_count=helpers.count_words(soup),
            link_count=helpers.count_links(soup),
            image_count=helpers.count_images(soup),
            fetched_at=utcnow(),
        )


def get_scraper() -> WebsiteScraper:
    return WebsiteScraper()
