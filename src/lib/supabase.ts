
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../supabase.config';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
