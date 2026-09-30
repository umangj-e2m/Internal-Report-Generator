from urllib.parse import urldefrag, urljoin, urlparse, urlunparse

from bs4 import BeautifulSoup, Tag

from models.domain.scraped_page import Heading
from utils.strings import normalize_whitespace, truncate

NOISE_TAGS = ("script", "style", "noscript", "svg", "iframe", "template", "canvas")
LAYOUT_TAGS = ("nav", "header", "footer", "aside", "form")
SKIPPED_EXTENSIONS = (
    ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".zip", ".rar",
    ".mp3", ".mp4", ".mov", ".avi", ".css", ".js", ".json", ".xml", ".txt", ".doc",
    ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
)
INDEX_FILES = ("index.html", "index.htm", "index.php", "default.htm", "default.html", "default.aspx")
MIN_PARAGRAPH_CHARS = 60
MAX_HEADINGS = 20
NO_CONTENT_SUMMARY = "No readable text content was found on this page."


def normalize_url(url: str) -> str:
    """Key used to detect duplicate pages: no fragment, lowercase host, no index file, no trailing slash."""
    url, _ = urldefrag(url.strip())
    parts = urlparse(url)
    directory, _, filename = parts.path.rpartition("/")
    path = f"{directory}/" if filename.lower() in INDEX_FILES else parts.path
    path = path.rstrip("/") or "/"
    return urlunparse((parts.scheme.lower(), parts.netloc.lower(), path, "", parts.query, ""))


def bare_host(url: str) -> str:
    host = urlparse(url).netloc.lower().split(":")[0]
    return host[4:] if host.startswith("www.") else host


def is_crawlable_link(url: str, site_host: str) -> bool:
    parts = urlparse(url)
    if parts.scheme not in ("http", "https"):
        return False
    if bare_host(url) != site_host:
        return False
    return not parts.path.lower().endswith(SKIPPED_EXTENSIONS)


def parse_html(html: str) -> BeautifulSoup:
    soup = BeautifulSoup(html, "lxml")
    for tag in soup.find_all(NOISE_TAGS):
        tag.decompose()
    return soup


def extract_internal_links(soup: BeautifulSoup, page_url: str, site_host: str) -> list[str]:
    """Absolute same-site links in page order, one per distinct `normalize_url` key."""
    links: list[str] = []
    seen: set[str] = set()
    for anchor in soup.find_all("a", href=True):
        absolute, _ = urldefrag(urljoin(page_url, anchor["href"].strip()))
        key = normalize_url(absolute)
        if key in seen or not is_crawlable_link(absolute, site_host):
            continue
        seen.add(key)
        links.append(absolute)
    return links


def extract_canonical_url(soup: BeautifulSoup, page_url: str) -> str | None:
    tag = soup.find("link", rel="canonical", href=True)
    return normalize_url(urljoin(page_url, tag["href"])) if tag else None


def extract_site_name(soup: BeautifulSoup, url: str) -> str:
    og_site = soup.find("meta", attrs={"property": "og:site_name"})
    if og_site and normalize_whitespace(og_site.get("content")):
        return normalize_whitespace(og_site["content"])[:255]
    return bare_host(url)


def extract_title(soup: BeautifulSoup, url: str) -> str:
    candidates = [
        soup.title.string if soup.title else None,
        _meta_content(soup, property_="og:title"),
        soup.h1.get_text(" ") if soup.h1 else None,
    ]
    for candidate in candidates:
        text = normalize_whitespace(candidate)
        if text:
            return truncate(text, 500)
    return url


def extract_meta_description(soup: BeautifulSoup) -> str | None:
    text = normalize_whitespace(
        _meta_content(soup, name="description") or _meta_content(soup, property_="og:description")
    )
    return text or None


def extract_headings(soup: BeautifulSoup) -> list[Heading]:
    headings: list[Heading] = []
    seen: set[str] = set()
    for tag in soup.find_all(["h1", "h2"]):
        text = normalize_whitespace(tag.get_text(" "))
        key = text.lower()
        if not text or key in seen:
            continue
        seen.add(key)
        headings.append(Heading(level=int(tag.name[1]), text=truncate(text, 200)))
        if len(headings) >= MAX_HEADINGS:
            break
    return headings


def extract_summary(soup: BeautifulSoup, meta_description: str | None, max_chars: int) -> str:
    content = _main_content(soup)
    paragraph_texts = (tag.get_text(" ") for tag in content.find_all(["p", "li"]))
    blocks = _meaningful_blocks(paragraph_texts, meta_description, max_chars)
    if not blocks:
        # Some sites put body text in <div>/<span> instead of <p>; fall back to long text lines.
        blocks = _meaningful_blocks(content.get_text("\n").splitlines(), meta_description, max_chars)

    if blocks:
        return truncate(" ".join(blocks), max_chars)
    return meta_description or NO_CONTENT_SUMMARY


def _meaningful_blocks(texts, meta_description: str | None, max_chars: int) -> list[str]:
    blocks: list[str] = []
    seen: set[str] = set()
    for raw in texts:
        text = normalize_whitespace(raw)
        if len(text) < MIN_PARAGRAPH_CHARS or text in seen or text == meta_description:
            continue
        seen.add(text)
        blocks.append(text)
        if sum(len(block) for block in blocks) >= max_chars:
            break
    return blocks


def count_words(soup: BeautifulSoup) -> int:
    body = soup.body or soup
    return len(body.get_text(" ").split())


def count_links(soup: BeautifulSoup) -> int:
    return len(soup.find_all("a", href=True))


def count_images(soup: BeautifulSoup) -> int:
    return len(soup.find_all("img"))


def _meta_content(soup: BeautifulSoup, name: str | None = None, property_: str | None = None) -> str | None:
    attrs = {"name": name} if name else {"property": property_}
    tag = soup.find("meta", attrs=attrs)
    return tag.get("content") if tag else None


def _main_content(soup: BeautifulSoup) -> Tag | BeautifulSoup:
    """Best-guess main content area with navigation/layout chrome removed (works on a copy)."""
    articles = soup.find_all("article", limit=2)
    single_article = articles[0] if len(articles) == 1 else None
    main = soup.find("main") or soup.find(attrs={"role": "main"}) or single_article or soup.body or soup
    copy = BeautifulSoup(str(main), "lxml")
    for tag in copy.find_all(LAYOUT_TAGS):
        tag.decompose()
    return copy
