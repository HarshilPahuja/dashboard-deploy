import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import AddDangerZone from './AddDangerZone';
import '../App.css';

function Home() {
  const [dangerZones, setDangerZones] = useState([]);
  const [sosZones, setSosZones] = useState([]);
  const [pendingAISuggestions, setPendingAISuggestions] = useState([]);
  const [approvedAISuggestions, setApprovedAISuggestions] = useState([]);
  const [savingId, setSavingId] = useState(null);

  // fetch danger zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/danger-zones');
        const data = await res.json();
        const validZones = data.filter(
          (zone) =>
            zone.lat !== undefined &&
            zone.lang !== undefined &&
            !isNaN(zone.lat) &&
            !isNaN(zone.lang)
        );
        setDangerZones(validZones);
      } catch (err) {
        console.error('Error fetching danger zones:', err);
      }
    };

    fetchZones();
    const interval = setInterval(fetchZones, 5000);
    return () => clearInterval(interval);
  }, []);

  // fetch SOS zones
  useEffect(() => {
    const fetchSOS = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/sos');
        const data = await res.json();
        const validSOS = data.filter(
          (sos) =>
            sos.lat !== undefined &&
            sos.lang !== undefined &&
            !isNaN(sos.lat) &&
            !isNaN(sos.lang)
        );
        setSosZones(validSOS);
      } catch (err) {
        console.error('Error fetching SOS:', err);
      }
    };

    fetchSOS();
    const interval = setInterval(fetchSOS, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddZone = (newZone) => {
    setDangerZones((prev) => [...prev, newZone]);
  };

  // Fetch AI suggestions from local endpoint
  const fetchAISuggestions = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/predict1');
      const data = await res.json();

      const suggestions = data.map((item, idx) => ({
        id: Date.now() + idx,
        name: `Predicted Zone ${idx + 1}`,
        lat: parseFloat(item.latitude),
        lang: parseFloat(item.longitude),
        radius: 50, // default radius for DB insert
        message: `AI-detected risk zone: ${item.risk}`,
        severity: item.risk
      }));

      setPendingAISuggestions(suggestions);
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
    }
  };

  // Approve suggestion -> add to Supabase, remove from pending
  const handleApprove = async (id) => {
    const approved = pendingAISuggestions.find((s) => s.id === id);
    if (!approved) return;

    setSavingId(id);

    try {
      const res = await fetch('http://localhost:3000/api/danger-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: approved.lat.toString(),
          lang: approved.lang.toString(),
          radius: 50, // radius fixed for DB
          message: "danger zone"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Failed to save AI suggestion:', data.error);
        setSavingId(null);
        return;
      }

      // Remove from pending AI suggestions
      setPendingAISuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error saving AI suggestion:', err);
    } finally {
      setSavingId(null);
    }
  };

  // Ignore suggestion -> just remove from pending
  const handleIgnore = (id) => {
    setPendingAISuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="dashboard">
      

      <div className="dashboard-content">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          <AddDangerZone onAdd={handleAddZone} />
          <div className="sos-list">
            <h2>Tourist SOS</h2>
            {sosZones.length === 0 ? (
              <p>No SOS alerts</p>
            ) : (
              <ul>
                {sosZones.map((sos) => (
                  <li key={sos.id}>
                    <strong>{sos.message}</strong>
                    <hr />
                    <a
                      href={`https://www.google.com/maps?q=${sos.lat},${sos.lang}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Maps
                    </a>
                    <br />
                    Lat: {sos.lat}, Lng: {sos.lang}, Radius: {sos.radius}m
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Map */}
        <main className="dashboard-map">
          <MapContainer
            center={[18.5204, 73.8567]}
            zoom={12}
            className="map-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {/* user added danger zones */}
            {dangerZones.map((zone) =>
              zone.lat !== undefined && zone.lang !== undefined ? (
                <Circle
                  key={zone.id}
                  center={[Number(zone.lat), Number(zone.lang)]}
                  radius={zone.radius}
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}
                >
                  <Popup>{zone.message}</Popup>
                </Circle>
              ) : null
            )}
            {/* SOS */}
            {sosZones.map((sos) =>
              sos.lat !== undefined && sos.lang !== undefined ? (
                <Circle
                  key={`sos-${sos.id}`}
                  center={[Number(sos.lat), Number(sos.lang)]}
                  radius={sos.radius}
                  pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.3 }}
                >
                  <Popup>{sos.message}</Popup>
                </Circle>
              ) : null
            )}
          </MapContainer>
        </main>

        {/* Right Sidebar – AI Suggestions */}
        <aside className="dashboard-sidebar dashboard-sidebar-right">
          <div className="ai-suggestions">
            <h2>AI Suggestions</h2>
            <button className="fetch-ai-btn" onClick={fetchAISuggestions}>
              Fetch AI Suggestions
            </button>

            {pendingAISuggestions.length === 0 ? (
              <p>No new suggestions</p>
            ) : (
              <ul>
                {pendingAISuggestions.map((ai) => (
                  <li key={ai.id}>
                    <strong>{ai.name}</strong> <br />
                    Lat: {ai.lat}, Lng: {ai.lang}, Radius: {ai.radius}m <br />
                    Message: {ai.message} <br />
                    Severity: <span className={`severity ${ai.severity.toLowerCase()}`}>{ai.severity}</span>
                    <div className="ai-buttons">
                      <button 
                        onClick={() => handleApprove(ai.id)} 
                        disabled={savingId === ai.id}
                      >
                        {savingId === ai.id ? 'Saving...' : 'Approve'}
                      </button>
                      <button onClick={() => handleIgnore(ai.id)}>Ignore</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;
