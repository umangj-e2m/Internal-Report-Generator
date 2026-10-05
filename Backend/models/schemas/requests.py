from pydantic import BaseModel, HttpUrl, field_validator

from services.exports.themes import BRANDS, FONTS, PALETTES, SIZES


class CreateReportRequest(BaseModel):
    url: HttpUrl


class UpdateReportStyleRequest(BaseModel):
    brand: str
    palette: str
    font_family: str
    font_size: str

    @field_validator("brand")
    @classmethod
    def known_brand(cls, value: str) -> str:
        return _one_of(value, BRANDS)

    @field_validator("palette")
    @classmethod
    def known_palette(cls, value: str) -> str:
        return _one_of(value, PALETTES)

    @field_validator("font_family")
    @classmethod
    def known_font(cls, value: str) -> str:
        return _one_of(value, FONTS)

    @field_validator("font_size")
    @classmethod
    def known_size(cls, value: str) -> str:
        return _one_of(value, SIZES)


def _one_of(value: str, choices: dict) -> str:
    if value not in choices:
        raise ValueError(f"must be one of: {', '.join(choices)}")
    return value
