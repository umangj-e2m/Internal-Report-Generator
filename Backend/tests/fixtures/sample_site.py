"""A small fake website served through httpx.MockTransport so scraper tests never hit the network."""
import httpx

from config import get_settings
from services.scraper.service import WebsiteScraper

BASE = "https://example.test"

HOME_HTML = f"""
<!doctype html>
<html>
<head>
  <title>Example Co – Home</title>
  <meta name="description" content="Example Co builds reliable software for growing teams.">
  <meta property="og:site_name" content="Example Co">
  <script>var tracking = "should never appear in reports";</script>
</head>
<body>
  <nav>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/blog">Blog</a>
    <a href="/contact">Contact</a>
    <a href="/careers">Careers</a>
    <a href="/about#team">About (duplicate with fragment)</a>
    <a href="https://other.test/partner">External partner</a>
    <a href="mailto:hello@example.test">Email</a>
    <a href="/brochure.pdf">Brochure</a>
  </nav>
  <main>
    <h1>Welcome to Example Co</h1>
    <h2>What we do</h2>
    <h2>What we do</h2>
    <h2>Our clients</h2>
    <p>Short line.</p>
    <p>Example Co designs, builds and maintains custom software products for startups and established businesses alike.</p>
    <p>Our cross-functional teams combine product strategy, user experience design and engineering under one roof.</p>
    <img src="/hero.png" alt="Hero"><img src="/team.png" alt="Team">
  </main>
  <footer><p>Copyright Example Co. This footer paragraph is long enough but must not be part of the summary.</p></footer>
</body>
</html>
"""


def _simple_page(title: str, body: str, description: str | None = None) -> str:
    meta = f'<meta name="description" content="{description}">' if description else ""
    return (
        f"<html><head><title>{title}</title>{meta}</head>"
        f"<body><main><h1>{title}</h1><p>{body}</p></main></body></html>"
    )


LONG_TEXT = "This page explains the topic in enough detail to count as a meaningful paragraph of content."

PAGES: dict[str, str] = {
    f"{BASE}/": HOME_HTML,
    f"{BASE}/about": _simple_page("About Example Co", LONG_TEXT, "Who we are."),
    f"{BASE}/services": _simple_page("Services", LONG_TEXT, "What we offer."),
    f"{BASE}/blog": _simple_page("Blog", LONG_TEXT),
    f"{BASE}/contact": _simple_page("Contact", "Call us."),
    f"{BASE}/careers": _simple_page("Careers", LONG_TEXT),
}


def mock_transport(pages: dict[str, str], failing: tuple[str, ...] = ()) -> httpx.MockTransport:
    def handler(request: httpx.Request) -> httpx.Response:
        url = str(request.url)
        if url in failing:
            return httpx.Response(500)
        html = pages.get(url)
        if html is None:
            return httpx.Response(404, text="Not found")
        return httpx.Response(200, html=html)

    return httpx.MockTransport(handler)


def make_scraper(
    pages: dict[str, str] | None = None,
    max_pages: int = 5,
    failing: tuple[str, ...] = (),
) -> WebsiteScraper:
    settings = get_settings().model_copy(update={"scraper_max_pages": max_pages})
    client = httpx.Client(transport=mock_transport(pages or PAGES, failing), follow_redirects=True)
    return WebsiteScraper(settings=settings, client=client)
