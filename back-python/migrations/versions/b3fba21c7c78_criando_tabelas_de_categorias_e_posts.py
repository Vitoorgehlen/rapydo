"""Criando tabelas de categorias e posts

Revision ID: b3fba21c7c78
Revises: d99e778ba542
Create Date: 2025-03-09 15:49:11.759902

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3fba21c7c78'
down_revision: Union[str, None] = 'd99e778ba542'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Criação da tabela categories
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('name', sa.String, nullable=False, unique=True),
        sa.Column('parent_id', sa.Integer, sa.ForeignKey('categories.id'), nullable=True),
        sa.Column('image_url', sa.String, nullable=True)
    )

    # Criação da tabela posts
    op.create_table(
        'posts',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('title', sa.String, nullable=False),
        sa.Column('content', sa.JSON, nullable=False),
        sa.Column('category_id', sa.Integer, sa.ForeignKey('categories.id'), nullable=True)
    )


def downgrade() -> None:
    # Remover as tabelas caso seja necessário reverter a migração
    op.drop_table('posts')
    op.drop_table('categories')