import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import supabase from './supabaseClient.js';

const app = express();
const PORT = 3000;

app.use(cors({
  origin: '*' 
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ SIH Backend is running successfully!');
});

// ✅ Main API route: Get all danger zones
app.get('/api/danger-zones', async (req, res) => {
  try {
    // Fetch data from Supabase table
    const { data, error } = await supabase
      .from('danger_zones') // Replace with your actual table name
      .select('id, lat, lang, radius, message');

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch danger zones' });
    }

    // Send JSON response to the frontend
    res.status(200).json(data);
  } catch (err) {
    console.error('❌ Server error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.post('/api/danger-zones', async (req, res) => {
  const { lat, lang, radius, message } = req.body;

  // Basic input validation
  if (lat === undefined || lang === undefined || radius === undefined || message === undefined) {
    return res.status(400).json({ error: 'Missing latitude, longitude, radius, or message' });
  }

  try {
    const { data, error } = await supabase
      .from('danger_zones')
      .insert([{ lat, lang, radius, message }])
      .select(); // <-- add select() to return the inserted row including id

    if (error) {
      console.error('Supabase insert error:', error.message);
      return res.status(500).json({ error: 'Failed to insert danger zone' });
    }

    // data[0] contains the inserted row with id
    res.status(201).json({ message: 'Danger zone added successfully', data: data[0] });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// below your other routes
app.get('/api/crowdsourcing', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('crowdsource') // your table name
      .select('id, lat, lang, dsc, img');

    if (error) {
      console.error('Supabase crowdsourcing error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch crowdsourcing data' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/sos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sos') // your table name
      .select('id, lat, lang, radius, message');

    if (error) {
      console.error('Supabase SOS error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch SOS' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// ✅ Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 SIH backend is running at http://localhost:${PORT}`);
});
