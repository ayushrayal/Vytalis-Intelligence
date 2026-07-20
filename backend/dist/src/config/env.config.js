"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load .env file
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000').transform((val) => parseInt(val, 10)),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:5173'),
    MONGODB_URI: zod_1.z.string().default('mongodb://localhost:27017/vytalis_db'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    TOKEN_ENCRYPTION_KEY: zod_1.z.string().min(64, 'TOKEN_ENCRYPTION_KEY must be a 64-character hex string'),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16),
    GOOGLE_CLIENT_ID: zod_1.z.string().default('mock_google_client_id'),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().default('mock_google_client_secret'),
    GOOGLE_REDIRECT_URI: zod_1.z.string().default('http://localhost:5000/api/v1/auth/google/callback'),
    META_APP_ID: zod_1.z.string().default('mock_meta_app_id'),
    META_APP_SECRET: zod_1.z.string().default('mock_meta_app_secret'),
    META_REDIRECT_URI: zod_1.z.string().default('http://localhost:5000/api/v1/integrations/meta/callback'),
    SHOPIFY_CLIENT_ID: zod_1.z.string().default('mock_shopify_client_id'),
    SHOPIFY_CLIENT_SECRET: zod_1.z.string().default('mock_shopify_client_secret'),
    SHOPIFY_SCOPES: zod_1.z.string().default('read_products,read_orders,read_customers'),
    SHOPIFY_REDIRECT_URI: zod_1.z.string().default('http://localhost:5000/api/v1/shopify/callback'),
    RAZORPAY_KEY_ID: zod_1.z.string().default('rzp_test_mock'),
    RAZORPAY_KEY_SECRET: zod_1.z.string().default('mock_razorpay_secret'),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().default('mock_webhook_secret'),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
    process.exit(1);
}
exports.env = _env.data;
