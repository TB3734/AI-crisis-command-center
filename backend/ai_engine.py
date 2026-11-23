
import re


DISASTER_KEYWORDS = {
    "Flood": [
        "flood", "flooding", "waterlogging",
        "waterlogged", "heavy rainfall",
        "overflow", "submerged", "water level",
        "drainage", "water rising"
    ],
    "Cyclone": [
        "cyclone", "hurricane", "strong winds",
        "high winds", "storm surge",
        "cyclonic storm", "wind damage"
    ],
    "Earthquake": [
        "earthquake", "tremor", "tremors",
        "seismic", "ground shaking",
        "building shaking", "aftershock"
    ],
    "Landslide": [
        "landslide", "mudslide", "rockfall",
        "slope collapse", "soil erosion",
        "hill collapse", "debris flow"
    ]
}


def classify_disaster(description: str):
    text = description.lower()

    scores = {}

    for disaster, keywords in DISASTER_KEYWORDS.items():
        scores[disaster] = 0

        for keyword in keywords:
            pattern = r"\b" + re.escape(keyword) + r"\b"

            if re.search(pattern, text):
                scores[disaster] += 1

    best_match = max(scores, key=scores.get)

    if scores[best_match] == 0:
        return {
            "disaster_type": "Unknown",
            "confidence": 0.0,
            "method": "keyword_matching"
        }

    total_matches = sum(scores.values())

    confidence = round(
        scores[best_match] / total_matches,
        2
    )

    return {
        "disaster_type": best_match,
        "confidence": confidence,
        "method": "keyword_matching"
    }


# ---------------------------------
# Automatic Severity Prediction
# ---------------------------------

SEVERITY_KEYWORDS = {
    3: [
        "people trapped",
        "person trapped",
        "trapped",
        "unconscious",
        "critical condition",
        "serious injuries",
        "severely injured",
        "multiple injured",
        "missing people",
        "building collapsed",
        "collapsed building",
        "immediate danger",
        "life threatening",
        "drowning",
        "fatalities",
        "dead bodies"
    ],

    2: [
        "road blocked",
        "roads blocked",
        "waterlogging",
        "waterlogged",
        "flooding",
        "heavy rainfall",
        "strong winds",
        "damaged houses",
        "power outage",
        "electricity failure",
        "landslide",
        "evacuation required",
        "water rising"
    ]
}


def predict_severity(description: str):
    text = description.lower()

    # Check severe emergencies first
    for keyword in SEVERITY_KEYWORDS[3]:
        pattern = r"\b" + re.escape(keyword) + r"\b"

        if re.search(pattern, text):
            return {
                "severity": 3,
                "label": "Severe",
                "reason": f"Detected critical indicator: {keyword}"
            }

    # Check medium emergencies
    for keyword in SEVERITY_KEYWORDS[2]:
        pattern = r"\b" + re.escape(keyword) + r"\b"

        if re.search(pattern, text):
            return {
                "severity": 2,
                "label": "Medium",
                "reason": f"Detected risk indicator: {keyword}"
            }

    # Default severity
    return {
        "severity": 1,
        "label": "Normal",
        "reason": "No predefined severity indicators detected"
    }


# ---------------------------------
# Duplicate Incident Detection
# ---------------------------------

from difflib import SequenceMatcher
from datetime import datetime, timezone


def normalize_text(text: str):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def calculate_similarity(text1: str, text2: str):
    normalized1 = normalize_text(text1)
    normalized2 = normalize_text(text2)

    return SequenceMatcher(
        None,
        normalized1,
        normalized2
    ).ratio()


def detect_duplicate(
    disaster_type: str,
    location: str,
    description: str,
    existing_incidents: list
):
    potential_duplicates = []

    for incident in existing_incidents:

        # Only compare the same disaster type
        if normalize_text(
            incident.disaster_type
        ) != normalize_text(disaster_type):
            continue

        # Only compare reports from the last 24 hours
        reported_at = incident.reported_at

        if reported_at.tzinfo is None:
            reported_at = reported_at.replace(
                tzinfo=timezone.utc
            )

        hours_difference = (
            datetime.now(timezone.utc) -
            reported_at
        ).total_seconds() / 3600

        if not 0 <= hours_difference <= 24:
            continue

        location_similarity = calculate_similarity(
            location,
            incident.location
        )

        description_similarity = calculate_similarity(
            description,
            incident.description
        )

        # Require similar location and description
        if (
            location_similarity >= 0.80
            and description_similarity >= 0.45
        ):
            potential_duplicates.append({
                "incident_id": incident.id,
                "location_similarity": round(
                    location_similarity, 2
                ),
                "description_similarity": round(
                    description_similarity, 2
                ),
                "status": "Potential Duplicate"
            })

    return {
        "is_potential_duplicate": (
            len(potential_duplicates) > 0
        ),
        "matches": potential_duplicates
    }
