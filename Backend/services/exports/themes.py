"""Report styling choices: colour palette, font and text size, shared by every export format."""
from dataclasses import dataclass

from services.shared.constants import BRAND_ACCENT_HEX, BRAND_MUTED_HEX, BRAND_PRIMARY_HEX

TEXT_HEX = "1F2937"
MUTED_HEX = BRAND_MUTED_HEX
BORDER_HEX = "E5E7EB"
SURFACE_HEX = "F7F8FB"
SURFACE_STRONG_HEX = "EEF0F6"
WHITE_HEX = "FFFFFF"


@dataclass(frozen=True)
class Palette:
    key: str
    label: str
    primary: str
    accent: str


@dataclass(frozen=True)
class FontChoice:
    key: str
    label: str
    name: str
    css_stack: str


@dataclass(frozen=True)
class SizeChoice:
    key: str
    label: str
    scale: float


PALETTES = {
    palette.key: palette
    for palette in (
        Palette("classic", "Classic", BRAND_PRIMARY_HEX, BRAND_ACCENT_HEX),
        Palette("ocean", "Ocean", "0C3B5E", "0E9F9A"),
        Palette("berry", "Berry", "3D1E4F", "D9467A"),
        Palette("forest", "Forest", "1F4D3A", "D99A1E"),
        Palette("royal", "Royal", "1E3A8A", "F59E0B"),
        Palette("charcoal", "Charcoal", "2D3142", "E63946"),
    )
}

FONTS = {
    font.key: font
    for font in (
        FontChoice("segoe", "Segoe UI", "Segoe UI",
                   "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"),
        FontChoice("georgia", "Georgia", "Georgia",
                   "Georgia, 'Times New Roman', Times, serif"),
        FontChoice("calibri", "Calibri", "Calibri",
                   "Calibri, Carlito, 'Segoe UI', Arial, sans-serif"),
        FontChoice("arial", "Arial", "Arial",
                   "Arial, 'Helvetica Neue', Helvetica, sans-serif"),
        FontChoice("cambria", "Cambria", "Cambria",
                   "Cambria, Caladea, Georgia, serif"),
        FontChoice("trebuchet", "Trebuchet MS", "Trebuchet MS",
                   "'Trebuchet MS', 'Segoe UI', Arial, sans-serif"),
        FontChoice("verdana", "Verdana", "Verdana",
                   "Verdana, Geneva, 'DejaVu Sans', sans-serif"),
        FontChoice("tahoma", "Tahoma", "Tahoma",
                   "Tahoma, Verdana, 'Segoe UI', sans-serif"),
        FontChoice("candara", "Candara", "Candara",
                   "Candara, Calibri, 'Segoe UI', sans-serif"),
        FontChoice("times", "Times New Roman", "Times New Roman",
                   "'Times New Roman', Times, serif"),
        FontChoice("palatino", "Palatino", "Palatino Linotype",
                   "'Palatino Linotype', Palatino, 'Book Antiqua', serif"),
        FontChoice("constantia", "Constantia", "Constantia",
                   "Constantia, Cambria, Georgia, serif"),
    )
}

SIZES = {
    size.key: size
    for size in (
        SizeChoice("small", "Small", 0.92),
        SizeChoice("medium", "Medium", 1.0),
        SizeChoice("large", "Large", 1.1),
    )
}

DEFAULT_PALETTE = "classic"
DEFAULT_FONT = "segoe"
DEFAULT_SIZE = "medium"


@dataclass(frozen=True)
class ReportTheme:
    palette: Palette
    font: FontChoice
    size: SizeChoice

    @property
    def primary(self) -> str:
        return self.palette.primary

    @property
    def accent(self) -> str:
        return self.palette.accent

    @property
    def font_name(self) -> str:
        return self.font.name

    @property
    def scale(self) -> float:
        return self.size.scale

    def pt(self, size: float) -> float:
        """A font size in points, scaled and rounded to the half point Word and PowerPoint use."""
        return round(size * self.scale * 2) / 2

    def tint(self, color: str, amount: float) -> str:
        """`color` mixed with white; `amount` 0 keeps the colour, 1 gives white."""
        channels = (int(color[index:index + 2], 16) for index in (0, 2, 4))
        return "".join(f"{round(value + (255 - value) * amount):02X}" for value in channels)


def get_theme(palette: str | None = None, font: str | None = None,
              size: str | None = None) -> ReportTheme:
    return ReportTheme(
        palette=PALETTES.get(palette or "", PALETTES[DEFAULT_PALETTE]),
        font=FONTS.get(font or "", FONTS[DEFAULT_FONT]),
        size=SIZES.get(size or "", SIZES[DEFAULT_SIZE]),
    )


def theme_for(report) -> ReportTheme:
    return get_theme(report.palette, report.font_family, report.font_size)


DEFAULT_THEME = get_theme()
