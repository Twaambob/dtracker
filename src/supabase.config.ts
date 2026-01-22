// Supabase Configuration
// Using environment variables for security

import { getValidatedEnv } from './lib/env-validator';

// Validate environment variables before initialization
const env = getValidatedEnv();

export const supabaseConfig = {
    url: env.VITE_SUPABASE_URL,
    anonKey: env.VITE_SUPABASE_ANON_KEY
};

export const appId = "sovereign-debt-tracker";
