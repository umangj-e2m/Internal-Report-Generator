from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HeadingOut(BaseModel):
    level: int
    text: str


class ReportPageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    position: int
    url: str
    title: str
    meta_description: str | None
    headings: list[HeadingOut]
    summary: str
    word_count: int
    link_count: int
    image_count: int
    fetched_at: datetime


class ReportSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    source_url: str
    site_name: str
    page_count: int
    created_at: datetime
    share_url: str


class ReportStyleOut(BaseModel):
    brand: str
    palette: str
    font_family: str
    font_size: str


class ReportDetailOut(ReportSummaryOut):
    style: ReportStyleOut
    pages: list[ReportPageOut]


class PaletteOut(BaseModel):
    key: str
    label: str
    primary: str
    accent: str


class FontOut(BaseModel):
    key: str
    label: str
    css_stack: str


class SizeOut(BaseModel):
    key: str
    label: str


class BrandOut(BaseModel):
    key: str
    name: str
    logo_file: str
    style: ReportStyleOut


class StyleOptionsOut(BaseModel):
    palettes: list[PaletteOut]
    fonts: list[FontOut]
    sizes: list[SizeOut]
    brands: list[BrandOut]
    defaults: ReportStyleOut


class ReportListOut(BaseModel):
    items: list[ReportSummaryOut]
    total: int
    page: int
    page_size: int


class HealthOut(BaseModel):
    status: str
    database: str
