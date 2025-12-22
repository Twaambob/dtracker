/**
 * Environment Variable Validator
 * 
 * Fail-fast validation of required environment variables
 * Prevents app initialization with missing or invalid Firebase credentials
 */

interface EnvConfig {
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_DATABASE_URL: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
}

/**
 * Validate that all required environment variables are present
 */
function validateEnvVars(): EnvConfig {
  const requiredVars: (keyof EnvConfig)[] = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
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
      `Please ensure .env.local exists and contains all Firebase credentials.\n` +
      `See .env.template for the required format.`
    );
  }

  return config as EnvConfig;
}

/**
 * Validate Firebase configuration format
 */
function validateFirebaseConfig(config: EnvConfig): void {
  // Validate API Key format (should be alphanumeric, ~39 chars)
  if (!/^[A-Za-z0-9_-]{35,45}$/.test(config.VITE_FIREBASE_API_KEY)) {
    console.warn('⚠️ Firebase API Key format looks unusual. Please verify it\'s correct.');
  }

  // Validate Auth Domain format (should end with .firebaseapp.com)
  if (!config.VITE_FIREBASE_AUTH_DOMAIN.endsWith('.firebaseapp.com')) {
    console.warn('⚠️ Firebase Auth Domain should end with .firebaseapp.com');
  }

  // Validate Database URL format
  if (!config.VITE_FIREBASE_DATABASE_URL.startsWith('https://')) {
    console.warn('⚠️ Firebase Database URL should start with https://');
  }

  // Validate Project ID (alphanumeric with hyphens)
  if (!/^[a-z0-9-]+$/.test(config.VITE_FIREBASE_PROJECT_ID)) {
    console.warn('⚠️ Firebase Project ID format looks unusual.');
  }

  // Validate Storage Bucket (should end with .appspot.com or .firebasestorage.app)
  if (!config.VITE_FIREBASE_STORAGE_BUCKET.match(/\.(appspot\.com|firebasestorage\.app)$/)) {
    console.warn('⚠️ Firebase Storage Bucket format looks unusual.');
  }

  // Validate Messaging Sender ID (should be numeric)
  if (!/^\d+$/.test(config.VITE_FIREBASE_MESSAGING_SENDER_ID)) {
    console.warn('⚠️ Firebase Messaging Sender ID should be numeric.');
  }

  // Validate App ID format
  if (!config.VITE_FIREBASE_APP_ID.includes(':')) {
    console.warn('⚠️ Firebase App ID format looks unusual.');
  }
}

/**
 * Get validated environment configuration
 * Throws error if validation fails
 */
export function getValidatedEnv(): EnvConfig {
  const config = validateEnvVars();
  validateFirebaseConfig(config);

  console.log('✅ Environment variables validated successfully');

  return config;
}
