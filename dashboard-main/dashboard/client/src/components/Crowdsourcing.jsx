// components/Crowdsourcing.jsx
import { useEffect, useState } from "react";
import "../Crowdsourcing.css";

function Crowdsourcing() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrowdsourcing = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/crowdsourcing");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching crowdsourcing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrowdsourcing();
  }, []);

  return (
    <div className="crowd-container">
      <h2>Crowdsourcing Data</h2>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <div className="crowd-grid">
          {items.map((item) => (
            <div className="crowd-card" key={item.id}>
              <img src={item.img} alt="Crowdsourced" className="crowd-image" />
              <div className="crowd-content">
                <p className="crowd-dsc">{item.dsc}</p>
                <p className="crowd-coords">
                  Lat: {item.lat}, Lng: {item.lang}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Crowdsourcing;
