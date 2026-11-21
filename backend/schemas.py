
from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    disaster_type: str = Field(min_length=2, max_length=50)
    location: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=5)
    severity: int = Field(default=1, ge=1, le=3)

from typing import Literal


class IncidentStatusUpdate(BaseModel):
    status: Literal[
        "Reported",
        "Units Dispatched",
        "Reached",
        "Under Control"
    ]
