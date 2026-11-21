
# AI Crisis Command Center

An AI-assisted disaster response management and emergency dispatch simulation platform.

## About the Project

AI Crisis Command Center is a full-stack web application
designed to simulate disaster monitoring, incident reporting,
emergency prioritization, and response coordination.

The project initially focuses on Visakhapatnam, India.

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS
- Lucide React

**Backend**
- Python
- FastAPI
- SQLAlchemy

**Database**
- PostgreSQL

## Features Implemented

- Responsive command dashboard
- FastAPI REST API
- PostgreSQL database connectivity
- Backend health monitoring
- Incident API foundation
- Simulation mode interface

## Upcoming Features

- Citizen disaster reporting
- AI-based disaster classification
- Severity prediction
- Duplicate incident detection
- Priority-based emergency response
- Interactive disaster map
- Simulated police, fire, ambulance and helicopter dispatch
- Admin dashboard and analytics

## Project Structure

    ai-crisis-command-center/
    ├── backend/
    ├── frontend/
    ├── .gitignore
    └── README.md

## How to Run

### Backend

1. Navigate to the `backend` folder.
2. Create and activate a Python virtual environment.
3. Install dependencies:

       pip install -r requirements.txt

4. Create a `.env` file using `.env.example`.
5. Configure your PostgreSQL database connection.
6. Start the server:

       python -m uvicorn main:app --reload

### Frontend

1. Navigate to the `frontend` folder.
2. Install dependencies:

       npm install

3. Start the development server:

       npm run dev

4. Open http://localhost:5173

## Disclaimer

This project is an educational emergency response simulation.
It is not connected to real emergency services.

## Project Status

Phase 1: Full-stack setup and initial dashboard completed.

Phase 2: Incident reporting and management (upcoming).
