import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lttmjnjcvrwswqzaconr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0dG1qbmpjdnJ3c3dxemFjb25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDcwNTUsImV4cCI6MjA3NzMyMzA1NX0.uRJaVutL5hk7MPeF8Km_jd4_iSOZU2QHNYjs4EMpIBA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
