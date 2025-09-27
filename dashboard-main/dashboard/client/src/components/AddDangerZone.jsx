import { useState } from 'react';
import  '../AddDangerZone.css';


function AddDangerZone({ onAdd }) {
  const [formData, setFormData] = useState({
    lat: '',
    lang: '',
    radius: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/danger-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: Number(formData.lat),
          lang: Number(formData.lang),
          radius: Number(formData.radius),
          message: formData.message
        })
      });

      if (!res.ok) throw new Error('Failed to add danger zone');

      const result = await res.json();
      const insertedZone = result.data;

      onAdd({
        id: insertedZone.id,
        lat: Number(insertedZone.lat),
        lang: Number(insertedZone.lang),
        radius: insertedZone.radius,
        message: insertedZone.message
      });
      setFormData({ lat: '', lang: '', radius: '', message: '' });
    } catch (err) {
      console.error(err);
      alert('Error adding danger zone');
    }
  };

  return (
    <form className="zone-form" onSubmit={handleSubmit}>
      <h2>Add Danger Zone</h2>
      <input
        type="number"
        step="any"
        name="lat"
        placeholder="Latitude"
        value={formData.lat}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        step="any"
        name="lang"
        placeholder="Longitude"
        value={formData.lang}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="radius"
        placeholder="Radius (meters)"
        value={formData.radius}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="message"
        placeholder="Message"
        value={formData.message}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Zone</button>
    </form>
  );
}

export default AddDangerZone;
