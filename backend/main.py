
from fastapi import Depends
from sqlalchemy.orm import Session

from database import engine
from models import Incident
from schemas import IncidentCreate, IncidentStatusUpdate


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
