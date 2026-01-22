/**
 * Environment Variable Validator
 * 
 * Fail-fast validation of required environment variables
 * Prevents app initialization with missing or invalid Supabase credentials
 */

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

/**
 * Validate that all required environment variables are present
 */
function validateEnvVars(): EnvConfig {
  const requiredVars: (keyof EnvConfig)[] = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing: string[] = [];
  const config: Partial<EnvConfig> = {};

  for (const varName of requiredVars) {
    const value = import.meta.env[varName];

    if (!value || value === '' || value === 'undefined') {
      missing.push(varName);
    } else {
      config[varName] = value;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Please ensure .env.local exists and contains all Supabase credentials.\n` +
      `See .env.template for the required format.`
    );
  }

  return config as EnvConfig;
}

/**
 * Validate Supabase configuration format
 */
function validateSupabaseConfig(config: EnvConfig): void {
  // Validate Supabase URL format (should be https://*.supabase.co)
  if (!config.VITE_SUPABASE_URL.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
    console.warn('⚠️ Supabase URL format looks unusual. Should be https://your-project.supabase.co');
  }

  // Validate Anon Key format (should be a JWT-like string)
  if (config.VITE_SUPABASE_ANON_KEY.length < 100) {
    console.warn('⚠️ Supabase Anon Key seems too short. Please verify it\'s correct.');
  }
}

/**
 * Get validated environment configuration
 * Throws error if validation fails
 */
export function getValidatedEnv(): EnvConfig {
  const config = validateEnvVars();
  validateSupabaseConfig(config);

  console.log('✅ Environment variables validated successfully');

  return config;
}
