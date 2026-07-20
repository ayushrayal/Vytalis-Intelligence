import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  MONGODB_URI: z.string().default('mongodb://localhost:27017/vytalis_db'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  TOKEN_ENCRYPTION_KEY: z.string().min(64, 'TOKEN_ENCRYPTION_KEY must be a 64-character hex string'),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),

  GOOGLE_CLIENT_ID: z.string().default('mock_google_client_id'),
  GOOGLE_CLIENT_SECRET: z.string().default('mock_google_client_secret'),
  GOOGLE_REDIRECT_URI: z.string().default('http://localhost:5000/api/v1/auth/google/callback'),

  META_APP_ID: z.string().default('mock_meta_app_id'),
  META_APP_SECRET: z.string().default('mock_meta_app_secret'),
  META_REDIRECT_URI: z.string().default('http://localhost:5000/api/v1/meta/callback'),

  SHOPIFY_CLIENT_ID: z.string().default('mock_shopify_client_id'),
  SHOPIFY_CLIENT_SECRET: z.string().default('mock_shopify_client_secret'),
  SHOPIFY_SCOPES: z.string().default('read_products,read_orders,read_customers'),
  SHOPIFY_REDIRECT_URI: z.string().default('http://localhost:5000/api/v1/shopify/callback'),

  RAZORPAY_KEY_ID: z.string().default('rzp_test_mock'),
  RAZORPAY_KEY_SECRET: z.string().default('mock_razorpay_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('mock_webhook_secret'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
