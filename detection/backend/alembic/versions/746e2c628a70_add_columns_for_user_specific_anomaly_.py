"""Add columns for user-specific anomaly detection

Revision ID: 746e2c628a70
Revises: 2284859e9e96
Create Date: 2025-07-09 23:00:35.457805

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '746e2c628a70'
down_revision: Union[str, Sequence[str], None] = '2284859e9e96'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('login_activity', sa.Column('is_user_specific_anomaly', sa.Boolean(), nullable=True))
    op.add_column('login_activity', sa.Column('user_anomaly_score', sa.Float(), nullable=True))
    op.add_column('login_activity', sa.Column('user_anomaly_reason', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('login_activity', 'user_anomaly_reason')
    op.drop_column('login_activity', 'user_anomaly_score')
    op.drop_column('login_activity', 'is_user_specific_anomaly')
    # ### end Alembic commands ###
