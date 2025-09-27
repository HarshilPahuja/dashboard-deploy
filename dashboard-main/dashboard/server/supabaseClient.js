// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // loads .env automatically

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default supabase;
