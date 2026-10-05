"""add brand to reports

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-05

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("reports", sa.Column("brand", sa.String(length=20), server_default="e2m",
                                       nullable=False))


def downgrade() -> None:
    op.drop_column("reports", "brand")
