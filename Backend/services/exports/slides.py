"""Slide deck model shared by the PPTX export and the HTML slide view.

All positions and sizes are in inches on a 13.333 x 7.5 in (16:9) slide, so both renderers place
every element identically. Long page content is split across as many slides as it needs.
"""
from dataclasses import dataclass, field

from config import get_settings
from models.db import Report, ReportPage
from services.exports.charts import ChartFormat, build_charts, build_page_chart
from services.exports.helpers import ReportTotals, compute_totals, generated_at_label
from services.exports.themes import ReportTheme, theme_for
from services.reports.helpers import share_url
from services.shared.constants import REPORT_TITLE
from utils.dates import format_display
from utils.strings import truncate

SLIDE_WIDTH = 13.333
SLIDE_HEIGHT = 7.5
MARGIN_X = 0.6
CONTENT_WIDTH = SLIDE_WIDTH - 2 * MARGIN_X

# Content slides (page continuation) place sections between these two lines.
BODY_TOP = 2.3
BODY_BOTTOM = 6.8
BODY_HEIGHT = BODY_BOTTOM - BODY_TOP

SECTION_TITLE_HEIGHT = 0.42
SECTION_GAP = 0.2
HEADING_ROW_HEIGHT = 0.3
TEXT_LINE_HEIGHT = 0.25
TEXT_BOX_PADDING = 0.14
TEXT_CHARS_PER_LINE = 132

HEADING_CHARS = 112
PAGE_TITLE_CHARS = 80
PAGE_URL_CHARS = 130
META_ON_OVERVIEW_CHARS = 300
SUMMARY_ROWS_PER_SLIDE = 5
TABLE_TITLE_CHARS = 70
TABLE_URL_CHARS = 55
TABLE_DESCRIPTION_CHARS = 120

NO_META_MESSAGE = "This page does not provide a meta description."
NO_HEADINGS_MESSAGE = "No H1 or H2 headings were found on this page."


@dataclass
class Slide:
    kind: str
    title: str = ""
    data: dict = field(default_factory=dict)
    number: int = 0


@dataclass(frozen=True)
class SlideDeck:
    report_title: str
    brand_name: str
    site_name: str
    source_url: str
    share_url: str
    created_at: str
    generated_at: str
    page_count: int
    totals: ReportTotals
    slides: list[Slide]
    theme: ReportTheme


def text_line_height(theme: ReportTheme) -> float:
    return TEXT_LINE_HEIGHT * theme.scale


def build_deck(report: Report, fmt: ChartFormat) -> SlideDeck:
    settings = get_settings()
    theme = theme_for(report)
    slides = [Slide("title"), Slide("overview", "Overview")]
    slides += _summary_slides(report)
    slides += [Slide("chart", chart.title, {"chart": chart}) for chart in build_charts(report, fmt)]
    for page in report.pages:
        slides += _page_slides(page, fmt, theme)
    slides.append(Slide("closing"))
    for number, slide in enumerate(slides, start=1):
        slide.number = number

    return SlideDeck(
        report_title=REPORT_TITLE,
        brand_name=settings.report_brand_name,
        site_name=report.site_name,
        source_url=report.source_url,
        share_url=share_url(report.slug),
        created_at=format_display(report.created_at, settings.report_timezone),
        generated_at=generated_at_label(),
        page_count=report.page_count,
        totals=compute_totals(report),
        slides=slides,
        theme=theme,
    )


def _summary_slides(report: Report) -> list[Slide]:
    rows = [
        {
            "position": page.position,
            "title": truncate(page.title, TABLE_TITLE_CHARS),
            "url": truncate(page.url, TABLE_URL_CHARS),
            "description": truncate(page.meta_description or page.summary, TABLE_DESCRIPTION_CHARS),
            "words": page.word_count,
            "links": page.link_count,
            "images": page.image_count,
        }
        for page in report.pages
    ]
    chunks = [rows[start:start + SUMMARY_ROWS_PER_SLIDE]
              for start in range(0, len(rows), SUMMARY_ROWS_PER_SLIDE)] or [[]]
    return [
        Slide("summary", "Summary" if index == 0 else "Summary (continued)",
              {"rows": chunk, "show_total": index == len(chunks) - 1})
        for index, chunk in enumerate(chunks)
    ]


def _page_slides(page: ReportPage, fmt: ChartFormat, theme: ReportTheme) -> list[Slide]:
    settings = get_settings()
    heading = {
        "position": page.position,
        "title": truncate(page.title, PAGE_TITLE_CHARS),
        "url": truncate(page.url, PAGE_URL_CHARS),
    }
    meta = page.meta_description or ""
    meta_fits = len(meta) <= META_ON_OVERVIEW_CHARS
    overview = Slide("page", page.title, {
        **heading,
        "stats": [
            ("Words", f"{page.word_count:,}"),
            ("Links", f"{page.link_count:,}"),
            ("Images", f"{page.image_count:,}"),
            ("Read on", format_display(page.fetched_at, settings.report_timezone)),
        ],
        "chart": build_page_chart(page, fmt, theme),
        "meta": meta if meta and meta_fits else None,
        "meta_note": None if meta else NO_META_MESSAGE,
    })

    packer = _SectionPacker(theme)
    if meta and not meta_fits:
        packer.add_text("Meta description", meta)
    packer.add_headings(
        [{"level": item["level"], "text": truncate(item["text"], HEADING_CHARS)}
         for item in page.headings]
    )
    packer.add_text("Content summary", page.summary)

    return [overview] + [
        Slide("page_content", page.title, {**heading, "sections": sections})
        for sections in packer.slides
    ]


class _SectionPacker:
    """Fills content slides top to bottom and starts a new slide when the body height runs out."""

    def __init__(self, theme: ReportTheme) -> None:
        self.slides: list[list[dict]] = [[]]
        self.cursor = 0.0
        self.line_height = text_line_height(theme)
        self.chars_per_line = int(TEXT_CHARS_PER_LINE / theme.scale)

    @property
    def remaining(self) -> float:
        return BODY_HEIGHT - self.cursor

    def add_headings(self, headings: list[dict]) -> None:
        section = self._start("Key headings", "headings", HEADING_ROW_HEIGHT)
        if not headings:
            section["note"] = NO_HEADINGS_MESSAGE
            self._grow(section, HEADING_ROW_HEIGHT)
        for heading in headings:
            if self.remaining < HEADING_ROW_HEIGHT:
                self._new_slide()
                section = self._start("Key headings", "headings", HEADING_ROW_HEIGHT)
            section["items"].append(heading)
            self._grow(section, HEADING_ROW_HEIGHT)

    def add_text(self, title: str, text: str) -> None:
        words = text.split()
        min_box = 2 * TEXT_BOX_PADDING + self.line_height
        section = self._start(title, "text", min_box)
        while True:
            max_lines = int((self.remaining - 2 * TEXT_BOX_PADDING) / self.line_height)
            taken, lines = _take_lines(words, max_lines, self.chars_per_line)
            words = words[len(taken):]
            section["text"] = " ".join(taken)
            section["lines"] = lines
            self._grow(section, lines * self.line_height + 2 * TEXT_BOX_PADDING)
            if not words:
                return
            self._new_slide()
            section = self._start(title, "text", min_box)

    def _start(self, title: str, kind: str, min_body: float) -> dict:
        gap = SECTION_GAP if self.slides[-1] else 0.0
        if self.remaining < gap + SECTION_TITLE_HEIGHT + min_body:
            self._new_slide()
            gap = 0.0
        continued = any(item["title"] == title for slide in self.slides for item in slide)
        section = {
            "title": f"{title} (continued)" if continued else title,
            "kind": kind,
            "items": [],
            "top": self.cursor + gap,
            "body_top": self.cursor + gap + SECTION_TITLE_HEIGHT,
            "body_height": 0.0,
        }
        self.slides[-1].append(section)
        self.cursor += gap + SECTION_TITLE_HEIGHT
        return section

    def _grow(self, section: dict, height: float) -> None:
        section["body_height"] += height
        self.cursor += height

    def _new_slide(self) -> None:
        self.slides.append([])
        self.cursor = 0.0


def _take_lines(words: list[str], max_lines: int, chars_per_line: int) -> tuple[list[str], int]:
    """Greedy word wrap at `chars_per_line`; returns the words that fit and the lines used."""
    taken: list[str] = []
    lines, line_length = 1, 0
    for word in words:
        needed = len(word) if line_length == 0 else line_length + 1 + len(word)
        if needed > chars_per_line and line_length:
            if lines == max_lines:
                break
            lines, needed = lines + 1, len(word)
        taken.append(word)
        line_length = needed
    return taken, lines
