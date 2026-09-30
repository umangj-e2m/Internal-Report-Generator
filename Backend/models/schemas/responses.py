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


class ReportDetailOut(ReportSummaryOut):
    pages: list[ReportPageOut]


class ReportListOut(BaseModel):
    items: list[ReportSummaryOut]
    total: int
    page: int
    page_size: int


class HealthOut(BaseModel):
    status: str
    database: str
