"""add palette, font_family and font_size to reports

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-01

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("reports", sa.Column("palette", sa.String(length=20), server_default="classic",
                                       nullable=False))
    op.add_column("reports", sa.Column("font_family", sa.String(length=20), server_default="segoe",
                                       nullable=False))
    op.add_column("reports", sa.Column("font_size", sa.String(length=20), server_default="medium",
                                       nullable=False))


def downgrade() -> None:
    op.drop_column("reports", "font_size")
    op.drop_column("reports", "font_family")
    op.drop_column("reports", "palette")
