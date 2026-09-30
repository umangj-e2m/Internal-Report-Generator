"""create reports and report_pages tables

Revision ID: 0001
Revises:
Create Date: 2026-09-30

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("source_url", sa.String(length=2048), nullable=False),
        sa.Column("site_name", sa.String(length=255), nullable=False),
        sa.Column("page_count", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reports")),
    )
    op.create_index(op.f("ix_reports_slug"), "reports", ["slug"], unique=True)
    op.create_index("ix_reports_created_at", "reports", ["created_at"])

    op.create_table(
        "report_pages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("report_id", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("meta_description", sa.Text(), nullable=True),
        sa.Column("headings", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("word_count", sa.Integer(), nullable=False),
        sa.Column("link_count", sa.Integer(), nullable=False),
        sa.Column("image_count", sa.Integer(), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["report_id"], ["reports.id"],
            name=op.f("fk_report_pages_report_id_reports"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_report_pages")),
        sa.UniqueConstraint("report_id", "position", name=op.f("uq_report_pages_report_id")),
    )
    op.create_index(op.f("ix_report_pages_report_id"), "report_pages", ["report_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_report_pages_report_id"), table_name="report_pages")
    op.drop_table("report_pages")
    op.drop_index("ix_reports_created_at", table_name="reports")
    op.drop_index(op.f("ix_reports_slug"), table_name="reports")
    op.drop_table("reports")
