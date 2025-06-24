import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wimtocizeffobljiikpw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbXRvY2l6ZWZmb2Jsamlpa3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODE4MTAsImV4cCI6MjA2NjM1NzgxMH0.gAuCUNAg4CHXuwha3gaoS3hSsYKk466aodK2zYlQlG8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
