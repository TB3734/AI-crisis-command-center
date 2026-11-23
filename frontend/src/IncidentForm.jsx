
import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function IncidentForm({ onIncidentCreated }) {
  const [form, setForm] = useState({
    disaster_type: "Flood",
    location: "",
    description: "",
    severity: 1
  });

  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");


  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "severity" ? Number(value) : value
    }));

    // Clear outdated AI analysis when the report changes
    if (name === "location" || name === "description") {
      setAnalysis(null);
      setAnalysisError("");
    }
  }



async function handleAnalyze() {
  if (!form.location.trim() || !form.description.trim()) {
    setAnalysisError("Enter a location and description first.");
    return;
  }

  setAnalyzing(true);
  setAnalysisError("");
  setAnalysis(null);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/analyze-incident",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          location: form.location,
          description: form.description
        })
      }
    );

    if (!response.ok) {
      throw new Error("AI analysis request failed.");
    }

    
    const data = await response.json();

    setAnalysis(data);

    // Automatically fill the form using AI predictions
    if (data.classification.disaster_type !== "Unknown") {
    setForm((previous) => ({
        ...previous,
        disaster_type: data.classification.disaster_type,
        severity: data.severity_prediction.severity
    }));
    } else {
    setAnalysisError(
        "Disaster type could not be identified. Please review the report manually."
    );
    }


  } catch (error) {
    setAnalysisError(error.message);
  } finally {
    setAnalyzing(false);
  }
}

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch(`${API_URL}/api/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Failed to submit incident");
      }

      const result = await response.json();

      setMessage(
        `Incident #${result.incident.id} reported successfully!`
      );

      
      setForm({
        disaster_type: "Flood",
        location: "",
        description: "",
        severity: 1
      });

      setAnalysis(null);
      setAnalysisError("");


      if (onIncidentCreated) {
        onIncidentCreated();
      }

    } catch (err) {
      setError(true);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Report New Incident</h2>

      <form className="incident-form" onSubmit={handleSubmit}>
        <label>
          Disaster Type
          <select
            name="disaster_type"
            value={form.disaster_type}
            onChange={handleChange}
          >
            <option value="Flood">Flood</option>
            <option value="Cyclone">Cyclone</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Landslide">Landslide</option>
          </select>
        </label>

        <label>
          Location
          <input
            type="text"
            name="location"
            placeholder="e.g. MVP Colony, Visakhapatnam"
            value={form.location}
            onChange={handleChange}
            minLength={3}
            maxLength={255}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            placeholder="Describe the emergency..."
            value={form.description}
            onChange={handleChange}
            minLength={5}
            required
          />
        </label>

        <label>
          Severity Level
          <select
            name="severity"
            value={form.severity}
            onChange={handleChange}
          >
            <option value={1}>1 - Normal</option>
            <option value={2}>2 - Medium</option>
            <option value={3}>3 - Severe</option>
          </select>
        </label>

        <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="analyze-button"
        >
            {analyzing ? "Analyzing..." : "Analyze with AI"}
        </button>

        {analysisError && (
            <p className="form-error">{analysisError}</p>
        )}

        {analysis && (
        <div className="ai-results">
            <h3>AI Analysis Results</h3>

            <p>
            <strong>Disaster Type:</strong>{" "}
            {analysis.classification.disaster_type}
            </p>

            <p>
            <strong>Severity:</strong>{" "}
            Level {analysis.severity_prediction.severity}
            {" — "}
            {analysis.severity_prediction.label}
            </p>

            <p>
            <strong>Reason:</strong>{" "}
            {analysis.severity_prediction.reason}
            </p>

            <p>
            <strong>Potential Duplicate:</strong>{" "}
            {analysis.duplicate_detection.is_potential_duplicate
                ? "Yes — review required"
                : "No match detected"}
            </p>

            {analysis.duplicate_detection.matches.map((match) => (
            <p key={match.incident_id}>
                Possible match: Incident #{match.incident_id}
            </p>
            ))}

            {analysis.requires_manual_review && (
            <p className="ai-warning">
                Manual review recommended.
            </p>
            )}
        </div>
        )}

        
        
        {!analysis && (
          <p className="analysis-reminder">
            AI analysis is not current. Review the disaster type
            and severity manually, or click Analyze with AI.
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Incident"}
        </button>



        {message && (
          <p
            className={error ? "form-error" : "form-success"}
            role="status"
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}

export default IncidentForm;
