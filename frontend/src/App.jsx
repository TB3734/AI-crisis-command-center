
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

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [backend, setBackend] = useState("Checking...");
  const [database, setDatabase] = useState("Checking...");
  const [incidents, setIncidents] = useState([]);

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

  const stats = [
    {
      title: "Total Incidents",
      value: incidents.length,
      icon: AlertTriangle
    },
    {
      title: "Active Emergencies",
      value: 0,
      icon: Activity
    },
    {
      title: "Units Dispatched",
      value: 0,
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

        <section className="panel">
          <h2>Recent Incidents</h2>

          <div className="empty-state">
            <AlertTriangle size={30} />
            <p>No incidents reported yet.</p>
            <small>
              Incident reporting will be added in Phase 2.
            </small>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
