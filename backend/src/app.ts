import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.config';
import { cookieMiddleware } from './middleware/cookie.middleware';
import { globalRateLimiter } from './middleware/rate-limit.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import metaRoutes from './modules/integrations/meta/meta.routes';
import shopifyRoutes from './modules/integrations/shopify/shopify.routes';

const app: Application = express();

// Trust reverse proxy (Render / Heroku / Cloudflare) for HTTPS cookie resolution
app.set('trust proxy', 1);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(globalRateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieMiddleware);

// Base API v1 Namespace Routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/integrations/meta', metaRoutes);
app.use('/api/v1/meta', metaRoutes);
app.use('/api/v1/shopify', shopifyRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
