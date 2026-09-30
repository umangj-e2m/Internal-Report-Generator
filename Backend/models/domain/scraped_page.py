from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class Heading:
    level: int
    text: str


@dataclass
class ScrapedPage:
    url: str
    title: str
    meta_description: str | None
    headings: list[Heading]
    summary: str
    word_count: int
    link_count: int
    image_count: int
    fetched_at: datetime


@dataclass
class ScrapeResult:
    source_url: str
    site_name: str
    pages: list[ScrapedPage] = field(default_factory=list)
