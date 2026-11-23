
from datetime import datetime, timezone
from types import SimpleNamespace

from ai_engine import detect_duplicate


existing_incidents = [
    SimpleNamespace(
        id=1,
        disaster_type="Flood",
        location="MVP Colony, Visakhapatnam",
        description="Heavy rainfall caused flooding on the main road",
        reported_at=datetime.now(timezone.utc)
    ),
    SimpleNamespace(
        id=2,
        disaster_type="Earthquake",
        location="Gajuwaka, Visakhapatnam",
        description="Buildings shaking after earthquake",
        reported_at=datetime.now(timezone.utc)
    )
]


result = detect_duplicate(
    disaster_type="Flood",
    location="MVP Colony Visakhapatnam",
    description="Heavy rainfall caused flooding on main road",
    existing_incidents=existing_incidents
)

print(result)
