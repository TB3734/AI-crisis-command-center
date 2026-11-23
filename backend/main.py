
from fastapi import Depends
from sqlalchemy.orm import Session

from database import engine
from models import Incident

from schemas import (
    IncidentCreate,
    IncidentStatusUpdate,
    IncidentAnalysisRequest
)

from ai_engine import (
    classify_disaster,
    predict_severity,
    detect_duplicate
)



from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create FastAPI application
app = FastAPI(
    title="AI Crisis Command Center",
    description="AI-Based Disaster Response Management System",
    version="1.0.0"
)

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["*"]
)

# Home endpoint
@app.get("/")
def home():
    return {
        "project": "AI Crisis Command Center",
        "message": "Welcome to the Disaster Response System",
        "status": "running"
    }

# Backend health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FastAPI Backend"
    }

# Incident endpoint

@app.get("/api/incidents")
def get_incidents(db: Session = Depends(get_db)):
    incidents = (
        db.query(Incident)
        .order_by(Incident.id.desc())
        .all()
    )

    return {
        "incidents": incidents,
        "total": len(incidents)
    }


@app.post("/api/incidents", status_code=201)
def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db)
):
    new_incident = Incident(
        disaster_type=incident.disaster_type,
        location=incident.location,
        description=incident.description,
        severity=incident.severity,
        status="Reported"
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return {
        "message": "Incident reported successfully",
        "incident": new_incident
    }


from database import check_database

@app.get("/api/database-status")
def database_status():
    try:
        check_database()
        return {
            "database": "connected",
            "message": "PostgreSQL connection successful"
        }
    except Exception:
        return {
            "database": "disconnected",
            "message": "Unable to connect to PostgreSQL"
        }

@app.patch("/api/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    update: IncidentStatusUpdate,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    allowed_transitions = {
        "Reported": "Units Dispatched",
        "Units Dispatched": "Reached",
        "Reached": "Under Control"
    }

    expected_status = allowed_transitions.get(
        incident.status
    )

    if update.status != expected_status:
        raise HTTPException(
            status_code=400,
            detail="Invalid status transition"
        )

    incident.status = update.status

    db.commit()
    db.refresh(incident)

    return {
        "message": "Incident status updated successfully",
        "incident": {
            "id": incident.id,
            "status": incident.status
        }
    }

@app.post("/api/analyze-incident")
def analyze_incident(
    report: IncidentAnalysisRequest,
    db: Session = Depends(get_db)
):
    # Classify disaster type
    classification = classify_disaster(
        report.description
    )

    # Predict severity
    severity = predict_severity(
        report.description
    )

    # Retrieve existing incidents
    existing_incidents = db.query(Incident).all()

    # Detect potential duplicates
    duplicates = detect_duplicate(
        disaster_type=classification["disaster_type"],
        location=report.location,
        description=report.description,
        existing_incidents=existing_incidents
    )

    # Return analysis results
    return {
        "classification": classification,
        "severity_prediction": severity,
        "duplicate_detection": duplicates,
        "requires_manual_review": (
            classification["disaster_type"] == "Unknown"
            or duplicates["is_potential_duplicate"]
            or severity["severity"] == 3
        )
    }
