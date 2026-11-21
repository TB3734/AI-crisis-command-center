
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime
)

from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    disaster_type = Column(String(50), nullable=False)

    location = Column(String(255), nullable=False)

    description = Column(Text, nullable=False)

    severity = Column(
        Integer,
        nullable=False,
        default=1
    )

    status = Column(
        String(50),
        nullable=False,
        default="Reported"
    )

    reported_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
