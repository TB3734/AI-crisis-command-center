
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Shield,
  Truck,
  Database,
  LayoutDashboard
} from "lucide-react";

import "./App.css";
import IncidentForm from "./IncidentForm";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [backend, setBackend] = useState("Checking...");
  const [database, setDatabase] = useState("Checking...");
  const [incidents, setIncidents] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const healthResponse = await fetch(
          `${API_URL}/api/health`
        );

        if (!healthResponse.ok) {
          throw new Error("Backend unavailable");
        }

        const health = await healthResponse.json();
        setBackend(health.status);

        const dbResponse = await fetch(
          `${API_URL}/api/database-status`
        );

        if (!dbResponse.ok) {
          throw new Error("Database status unavailable");
        }

        const db = await dbResponse.json();
        setDatabase(db.database);

        const incidentResponse = await fetch(
          `${API_URL}/api/incidents`
        );

        if (!incidentResponse.ok) {
          throw new Error("Incidents unavailable");
        }

        const incidentData = await incidentResponse.json();
        setIncidents(incidentData.incidents);

      } catch (error) {
        console.error(error);
        setBackend("Offline");
        setDatabase("Unknown");
      }
    }

    loadDashboard();
  }, []);


async function updateIncidentStatus(incident) {
  const nextStatus = {
    Reported: "Units Dispatched",
    "Units Dispatched": "Reached",
    Reached: "Under Control"
  }[incident.status];

  if (!nextStatus) return;

  setUpdatingId(incident.id);
  setStatusError("");

  try {
    const response = await fetch(
      `${API_URL}/api/incidents/${incident.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: nextStatus })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || "Failed to update incident"
      );
    }

    setIncidents((previous) =>
      previous.map((item) =>
        item.id === incident.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

  } catch (error) {
    setStatusError(error.message);
  } finally {
    setUpdatingId(null);
  }
}


  
const totalIncidents = incidents.length;

const activeEmergencies = incidents.filter(
  (incident) => incident.status !== "Under Control"
).length;

const dispatchedIncidents = incidents.filter(
  (incident) =>
    incident.status === "Units Dispatched" ||
    incident.status === "Reached"
).length;

const stats = [
  {
    title: "Total Incidents",
    value: totalIncidents,
    icon: AlertTriangle
  },
  {
    title: "Active Emergencies",
    value: activeEmergencies,
    icon: Activity
  },
  {
    title: "Dispatches in Progress",
    value: dispatchedIncidents,
    icon: Truck
  }
];


  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <Shield size={28} />
          <span>CRISIS COMMAND</span>
        </div>

        <nav>
          <div className="nav-item active">
            <LayoutDashboard size={18} />
            Dashboard
          </div>
        </nav>

        <div className="sidebar-footer">
          AI Crisis Command Center
          <small>Simulation Platform v1.0</small>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h1>Command Dashboard</h1>
            <p>
              Visakhapatnam Disaster Response System
            </p>
          </div>

          <span className="simulation">
            SIMULATION MODE
          </span>
        </header>

        <section className="stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="stat-card" key={stat.title}>
                <div className="stat-title">
                  <Icon size={20} />
                  {stat.title}
                </div>

                <h2>{stat.value}</h2>
              </div>
            );
          })}
        </section>

        <section className="panel">
          <h2>System Status</h2>

          <div className="status-row">
            <Activity size={19} />
            <span>FastAPI Backend</span>
            <strong>{backend}</strong>
          </div>

          <div className="status-row">
            <Database size={19} />
            <span>PostgreSQL Database</span>
            <strong>{database}</strong>
          </div>
        </section>

        <IncidentForm
          onIncidentCreated={() => window.location.reload()}
        />

        
<section className="panel">
  <h2>Recent Incidents</h2>
  {statusError && (
  <p className="form-error" role="alert">
    {statusError}
  </p>
)}

  {incidents.length === 0 ? (
    <div className="empty-state">
      <AlertTriangle size={30} />
      <p>No incidents reported yet.</p>
    </div>
  ) : (
    <div className="table-container">
      <table className="incident-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Disaster</th>
            <th>Location</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Reported At</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td>#{incident.id}</td>
              <td>{incident.disaster_type}</td>
              <td>{incident.location}</td>
              <td>
                <span
                  className={`severity severity-${incident.severity}`}
                >
                  Level {incident.severity}
                </span>
              </td>
              <td>{incident.status}</td>
              <td>

            <td>
              <button
                className="status-button"
                disabled={
                  updatingId === incident.id ||
                  incident.status === "Under Control"
                }
                onClick={() => updateIncidentStatus(incident)}
              >
                {updatingId === incident.id
                  ? "Updating..."
                : {
                    Reported: "Dispatch Units",
                    "Units Dispatched": "Mark as Reached",
                    Reached: "Mark Under Control",
                    "Under Control": "Completed"
                  }[incident.status] || "Unavailable"}
              </button>
            </td>

                {new Date(incident.reported_at).toLocaleString()}
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

      </main>
    </div>
  );
}

export default App;
