"""Adiciona relação parent_id em categories

Revision ID: dbf22f0ea0fb
Revises: 5fc7f7538bfb
Create Date: 2025-02-26 16:36:32.837433

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dbf22f0ea0fb'
down_revision: Union[str, None] = '5fc7f7538bfb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###
