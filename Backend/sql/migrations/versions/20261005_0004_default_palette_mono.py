"""make the black and white mono palette the default for new reports

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-05

"""
from collections.abc import Sequence

from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("reports", "palette", server_default="mono")


def downgrade() -> None:
    op.alter_column("reports", "palette", server_default="classic")
