import base64
from dataclasses import dataclass
from io import BytesIO
from typing import Literal

import matplotlib
from matplotlib.figure import Figure
from matplotlib.ticker import FuncFormatter, MaxNLocator

from models.db import Report, ReportPage
from services.shared.constants import BRAND_ACCENT_HEX, BRAND_MUTED_HEX, BRAND_PRIMARY_HEX
from utils.strings import truncate

ChartFormat = Literal["svg", "png"]

PRIMARY = f"#{BRAND_PRIMARY_HEX}"
ACCENT = f"#{BRAND_ACCENT_HEX}"
MUTED = f"#{BRAND_MUTED_HEX}"
TEXT = "#1F2937"
GRID = "#E5E7EB"
PIE_COLORS = (PRIMARY, ACCENT, "#4A5578", "#F7A26A", "#9AA1B5", "#FBD3B6")
PAGE_BAR_COLORS = (PRIMARY, ACCENT, "#9AA1B5")

MM_PER_INCH = 25.4
WIDE_SIZE_MM = (178, 78)
PAGE_BAR_SIZE_MM = (178, 36)
PNG_DPI = 220
PIE_LEGEND_CHARS = 44

_MEDIA_TYPES = {"svg": "image/svg+xml", "png": "image/png"}

# Figures are built with the object API (no pyplot), so these globals are only read at render time.
matplotlib.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Segoe UI", "Arial", "DejaVu Sans"],
    "font.size": 8,
    "text.color": TEXT,
    "axes.labelcolor": MUTED,
    "axes.edgecolor": GRID,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "svg.fonttype": "none",
})


@dataclass(frozen=True)
class ReportChart:
    title: str
    caption: str
    image: bytes
    media_type: str
    wide: bool = False

    @property
    def data_uri(self) -> str:
        return f"data:{self.media_type};base64,{base64.b64encode(self.image).decode('ascii')}"


def build_charts(report: Report, fmt: ChartFormat) -> list[ReportChart]:
    pages = report.pages
    if not pages:
        return []

    def chart(title: str, caption: str, figure: Figure, wide: bool = False) -> ReportChart:
        return ReportChart(title, caption, _render(figure, fmt), _MEDIA_TYPES[fmt], wide)

    charts = []
    if any(page.word_count for page in pages):
        charts.append(chart("Words per page", "Each page's share of the site's written content.",
                            _words_pie(pages), wide=True))
    charts.append(chart("Links and images by page",
                        "How the number of links and images changes across the pages.",
                        _links_images_line(pages), wide=True))
    return charts


def build_page_chart(page: ReportPage, fmt: ChartFormat) -> ReportChart | None:
    """Bars for one page's words, links and images; None when the page has none of them."""
    if not (page.word_count or page.link_count or page.image_count):
        return None
    return ReportChart(
        "Content breakdown",
        "Words, links and images found on this page.",
        _render(_page_bar(page), fmt),
        _MEDIA_TYPES[fmt],
    )


def _words_pie(pages: list[ReportPage]) -> Figure:
    figure = _figure(WIDE_SIZE_MM, layout=None)
    # Fixed boxes: the donut on the left, the legend in the remaining width to its right.
    axes = figure.add_axes((0.02, 0.03, 0.4, 0.94))
    values = [page.word_count for page in pages]
    total = sum(values)

    wedges, _, _ = axes.pie(
        values,
        colors=[PIE_COLORS[index % len(PIE_COLORS)] for index in range(len(values))],
        startangle=90,
        counterclock=False,
        autopct=lambda pct: f"{pct:.0f}%" if pct >= 5 else "",
        pctdistance=0.78,
        wedgeprops={"width": 0.44, "edgecolor": "white", "linewidth": 1.5},
        textprops={"color": "white", "fontsize": 8, "fontweight": "bold"},
    )
    axes.text(0, 0.08, f"{total:,}", ha="center", va="center", fontsize=12,
              fontweight="bold", color=PRIMARY)
    axes.text(0, -0.16, "words", ha="center", va="center", fontsize=8, color=MUTED)
    figure.legend(
        wedges,
        [f"{page.position:02d}  {truncate(page.title, PIE_LEGEND_CHARS)}  ·  "
         f"{page.word_count:,} ({page.word_count / total:.0%})" for page in pages],
        loc="center left", bbox_to_anchor=(0.46, 0.5), frameon=False, fontsize=8,
        handlelength=1, handleheight=1, labelspacing=1.1,
    )
    axes.set_aspect("equal")
    return figure


def _page_bar(page: ReportPage) -> Figure:
    figure = _figure(PAGE_BAR_SIZE_MM)
    axes = figure.add_subplot()
    series = (("Words", page.word_count), ("Links", page.link_count),
              ("Images", page.image_count))
    values = [value for _, value in series]
    positions = list(range(len(series)))

    bars = axes.barh(positions, values, height=0.6, color=PAGE_BAR_COLORS)
    axes.bar_label(bars, labels=[f"{value:,}" for value in values], padding=4, fontsize=8,
                   color=TEXT, fontweight="bold")
    axes.set_yticks(positions, [label for label, _ in series])
    axes.invert_yaxis()
    axes.set_xlim(0, max(values) * 1.12 or 1)
    axes.xaxis.set_major_formatter(FuncFormatter(lambda value, _: f"{int(value):,}"))
    _style_axes(axes, grid_axis="x")
    return figure


def _links_images_line(pages: list[ReportPage]) -> Figure:
    figure = _figure(WIDE_SIZE_MM)
    axes = figure.add_subplot()
    positions = [page.position for page in pages]
    series = (
        ("Links", [page.link_count for page in pages], PRIMARY),
        ("Images", [page.image_count for page in pages], ACCENT),
    )

    for label, values, color in series:
        axes.plot(positions, values, marker="o", markersize=4.5, linewidth=2, color=color,
                  label=label)
        for x, y in zip(positions, values):
            axes.annotate(f"{y:,}", (x, y), textcoords="offset points", xytext=(0, 6),
                          ha="center", fontsize=7.5, color=color)

    peak = max(max(values) for _, values, _ in series)
    axes.set_ylim(0, peak * 1.2 or 1)
    axes.set_xticks(positions, [f"{position:02d}" for position in positions])
    if len(positions) == 1:
        axes.set_xlim(positions[0] - 1, positions[0] + 1)
    axes.set_xlabel("Page")
    axes.yaxis.set_major_locator(MaxNLocator(nbins=5, integer=True))
    axes.legend(loc="lower center", bbox_to_anchor=(0.5, 1.0), ncol=2, frameon=False,
                fontsize=8)
    _style_axes(axes, grid_axis="y")
    return figure


def _figure(size_mm: tuple[int, int], layout: str | None = "constrained") -> Figure:
    width, height = size_mm
    return Figure(figsize=(width / MM_PER_INCH, height / MM_PER_INCH), layout=layout,
                  facecolor="white")


def _style_axes(axes, grid_axis: str) -> None:
    for side in ("top", "right"):
        axes.spines[side].set_visible(False)
    axes.grid(axis=grid_axis, color=GRID, linewidth=0.8)
    axes.set_axisbelow(True)
    axes.tick_params(length=0, pad=5)


def _render(figure: Figure, fmt: ChartFormat) -> bytes:
    buffer = BytesIO()
    # Without a date, the SVG output is identical between renders of the same data.
    metadata = {"Date": None} if fmt == "svg" else None
    figure.savefig(buffer, format=fmt, dpi=PNG_DPI, metadata=metadata)
    return buffer.getvalue()
