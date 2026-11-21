
import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function IncidentForm({ onIncidentCreated }) {
  const [form, setForm] = useState({
    disaster_type: "Flood",
    location: "",
    description: "",
    severity: 1
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "severity" ? Number(value) : value
    }));
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
