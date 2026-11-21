
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    allow_methods=["GET"],
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
def get_incidents():
    return {
        "incidents": [],
        "total": 0,
        "message": "No incidents reported yet"
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
