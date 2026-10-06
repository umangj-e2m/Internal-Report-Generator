"""make Explore Media (emerald, Trebuchet MS) the default branding for new reports

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-06

"""
from collections.abc import Sequence

from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("reports", "brand", server_default="explore")
    op.alter_column("reports", "palette", server_default="emerald")
    op.alter_column("reports", "font_family", server_default="trebuchet")


def downgrade() -> None:
    op.alter_column("reports", "brand", server_default="e2m")
    op.alter_column("reports", "palette", server_default="mono")
    op.alter_column("reports", "font_family", server_default="segoe")
