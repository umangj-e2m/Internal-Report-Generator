from typing import TYPE_CHECKING

from sqlalchemy import Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from models.db.report_page import ReportPage


class Report(TimestampMixin, Base):
    __tablename__ = "reports"
    __table_args__ = (Index("ix_reports_created_at", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    source_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    site_name: Mapped[str] = mapped_column(String(255), nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    palette: Mapped[str] = mapped_column(String(20), nullable=False, default="classic",
                                         server_default="classic")
    font_family: Mapped[str] = mapped_column(String(20), nullable=False, default="segoe",
                                             server_default="segoe")
    font_size: Mapped[str] = mapped_column(String(20), nullable=False, default="medium",
                                           server_default="medium")

    pages: Mapped[list["ReportPage"]] = relationship(
        back_populates="report",
        cascade="all, delete-orphan",
        order_by="ReportPage.position",
    )
