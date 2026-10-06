"""Element boxes (x, y, width, height in inches) shared by the PPTX and HTML slide renderers."""
from services.exports.helpers import watermark_font_size
from services.exports.slides import CONTENT_WIDTH, MARGIN_X, SLIDE_HEIGHT, SLIDE_WIDTH

Box = tuple[float, float, float, float]

RIGHT_EDGE = MARGIN_X + CONTENT_WIDTH


def fit_logo(box: Box, aspect: float, align: str = "left", scale: float = 1.0) -> Box:
    """The largest box with the logo's width/height `aspect` inside `box`, centred vertically.

    `scale` below 1 shrinks the logo to that share of the box height.
    """
    x, y, width, height = box
    fitted_width = min(width, height * scale * aspect)
    fitted_height = fitted_width / aspect
    if align == "center":
        x += (width - fitted_width) / 2
    return (x, y + (height - fitted_height) / 2, fitted_width, fitted_height)


# ---------- Chrome on every content slide ----------
# Logo boxes are the space a logo may fill; `fit_logo` keeps its proportions inside it.
HEADER_LOGO: Box = (MARGIN_X, 0.3, 2.4, 0.42)
HEADER_BRAND: Box = (1.12, 0.3, 5.0, 0.42)
HEADER_SITE: Box = (6.5, 0.3, RIGHT_EDGE - 6.5, 0.42)
HEADER_LINE_Y = 0.9
FOOTER_LINE_Y = 6.98
FOOTER_TEXT: Box = (MARGIN_X, 7.04, 9.0, 0.3)
FOOTER_NUMBER: Box = (RIGHT_EDGE - 2.0, 7.04, 2.0, 0.3)

SLIDE_TITLE: Box = (MARGIN_X, 1.08, CONTENT_WIDTH, 0.6)
SLIDE_TITLE_BAR: Box = (MARGIN_X, 1.72, 0.9, 0.06)

# ---------- Title slide ----------
TITLE_STRIP: Box = (0.0, 0.0, 0.35, SLIDE_HEIGHT)
TITLE_LOGO: Box = (1.0, 0.9, 3.6, 0.95)
TITLE_EYEBROW: Box = (1.0, 2.55, 11.0, 0.4)
TITLE_SITE: Box = (1.0, 2.95, 11.3, 1.1)
TITLE_URL: Box = (1.0, 4.1, 11.3, 0.45)
TITLE_BAR: Box = (1.0, 4.85, 1.2, 0.07)
TITLE_META: Box = (1.0, 5.15, 11.3, 0.4)
TITLE_BRAND: Box = (1.0, 6.55, 8.0, 0.4)

# ---------- Overview slide ----------
METRIC_TOP = 2.1
METRIC_HEIGHT = 1.35
METRIC_GAP = 0.25
METRIC_WIDTH = (CONTENT_WIDTH - 3 * METRIC_GAP) / 4
DETAILS: Box = (MARGIN_X, 3.8, CONTENT_WIDTH, 1.75)
DETAILS_ROW_TOP = 0.32
DETAILS_ROW_STEP = 0.42
DETAILS_LABEL_X = 0.35
DETAILS_VALUE_X = 3.2

# ---------- Summary slide ----------
TABLE_TOP = 2.05
TABLE_COLUMNS = (0.55, 4.25, 4.93, 0.9, 0.75, 0.75)
TABLE_HEADER_HEIGHT = 0.45
TABLE_ROW_HEIGHT = 0.76
TABLE_TOTAL_HEIGHT = 0.45

# ---------- Chart slide ----------
CHART_CAPTION: Box = (MARGIN_X, 1.9, CONTENT_WIDTH, 0.35)
CHART_IMAGE_HEIGHT = 4.4
CHART_IMAGE_WIDTH = CHART_IMAGE_HEIGHT * 178 / 78
CHART_IMAGE: Box = ((SLIDE_WIDTH - CHART_IMAGE_WIDTH) / 2, 2.4, CHART_IMAGE_WIDTH,
                    CHART_IMAGE_HEIGHT)

# ---------- Page slides ----------
PAGE_BADGE: Box = (MARGIN_X, 1.1, 0.75, 0.58)
PAGE_TITLE: Box = (1.55, 1.04, RIGHT_EDGE - 1.55, 0.44)
PAGE_URL: Box = (1.55, 1.48, RIGHT_EDGE - 1.55, 0.3)
PAGE_RULE: Box = (MARGIN_X, 1.95, CONTENT_WIDTH, 0.03)

STAT_TOP = 2.2
STAT_HEIGHT = 0.95
STAT_GAP = 0.2
STAT_SHARES = (0.22, 0.22, 0.22, 0.34)
STAT_COLUMNS: tuple[tuple[float, float], ...] = tuple(
    (MARGIN_X + sum(STAT_SHARES[:index]) * (CONTENT_WIDTH - 3 * STAT_GAP) + index * STAT_GAP,
     share * (CONTENT_WIDTH - 3 * STAT_GAP))
    for index, share in enumerate(STAT_SHARES)
)
BREAKDOWN_TITLE: Box = (MARGIN_X, 3.38, 6.0, 0.32)
BREAKDOWN_IMAGE: Box = (MARGIN_X, 3.72, 9.0, 9.0 * 36 / 178)
META_TITLE: Box = (MARGIN_X, 5.7, 6.0, 0.32)
META_TEXT: Box = (MARGIN_X, 6.02, CONTENT_WIDTH, 0.78)

TAG_SIZE = (0.42, 0.22)
H2_INDENT = 0.35
HEADING_TEXT_OFFSET = 0.55
TEXT_BAR_WIDTH = 0.05
TEXT_INSET_X = 0.25

# ---------- Watermark (content slides) ----------
WATERMARK: Box = (0.0, 0.0, SLIDE_WIDTH, SLIDE_HEIGHT)
WATERMARK_TEXT_WIDTH = 10.0


def watermark_size(text: str) -> float:
    """Font size in points for the company-name watermark across the middle of a slide."""
    return round(watermark_font_size(text, WATERMARK_TEXT_WIDTH * 72, 110), 1)


# ---------- Closing slide ----------
CLOSING_LOGO: Box = ((SLIDE_WIDTH - 3.6) / 2, 1.5, 3.6, 0.95)
CLOSING_TITLE: Box = (MARGIN_X, 2.75, CONTENT_WIDTH, 0.8)
CLOSING_BAR: Box = ((SLIDE_WIDTH - 1.2) / 2, 3.65, 1.2, 0.07)
CLOSING_LEAD: Box = (MARGIN_X, 3.95, CONTENT_WIDTH, 0.4)
CLOSING_LINK: Box = (MARGIN_X, 4.4, CONTENT_WIDTH, 0.45)
CLOSING_NOTE: Box = (MARGIN_X, 6.55, CONTENT_WIDTH, 0.35)
