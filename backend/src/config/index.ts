import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  
  // Database
  DATABASE_URL: z.string().min(1),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default('2000'),
  OPENAI_TEMPERATURE: z.string().transform(Number).default('0.7'),
  
  // Google OAuth (Legacy - keeping for backwards compatibility)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  
  // Firebase Configuration
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(), // JSON string
  FIREBASE_WEB_API_KEY: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  ENCRYPTION_KEY: z.string().length(32).optional(),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),
  ALLOWED_FILE_TYPES: z.string().default('pdf,doc,docx,txt,jpg,jpeg,png'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('./logs/app.log'),
  
  // Development flags
  ENABLE_DEBUG_ROUTES: z.string().transform(Boolean).default('false'),
  ENABLE_MOCK_INTEGRATIONS: z.string().transform(Boolean).default('false'),
  SKIP_AUTH_IN_DEV: z.string().transform(Boolean).default('false'),
});

// Validate and export configuration
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment configuration:');
  parseResult.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const config = parseResult.data;

// Export individual configurations for convenience
export const {
  NODE_ENV,
  PORT,
  API_BASE_URL,
  FRONTEND_URL,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  OPENAI_API_KEY,
  OPENAI_MODEL,
  OPENAI_MAX_TOKENS,
  OPENAI_TEMPERATURE,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  FIREBASE_PROJECT_ID,
  FIREBASE_SERVICE_ACCOUNT_KEY,
  FIREBASE_WEB_API_KEY,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  CORS_ORIGIN,
  BCRYPT_ROUNDS,
  ENCRYPTION_KEY,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
  ALLOWED_FILE_TYPES,
  LOG_LEVEL,
  LOG_FILE,
  ENABLE_DEBUG_ROUTES,
  ENABLE_MOCK_INTEGRATIONS,
  SKIP_AUTH_IN_DEV,
} = config;