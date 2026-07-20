import path from 'path';
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

// Trust Render / Reverse Proxy
app.set('trust proxy', 1);

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global Middlewares
app.use(globalRateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieMiddleware);

// Static Assets Serving (React Build in backend/public)
const publicPath = path.resolve(process.cwd(), 'public');
app.use(express.static(publicPath));

// API v1 Routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/integrations/meta', metaRoutes);
app.use('/api/v1/meta', metaRoutes);
app.use('/api/v1/shopify', shopifyRoutes);

// Unmatched API Route Handler (Returns 404 JSON for /api/*)
app.all('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// React SPA Catch-All Handler (Serves index.html for React Router pages)
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global Error Handler
app.use(errorMiddleware);

export default app;