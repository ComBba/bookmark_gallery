// Import the createClient function from the supabase-js library
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL from the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Get the Supabase anonymous key from the environment variables
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a Supabase client instance using the Supabase URL, anonymous key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
