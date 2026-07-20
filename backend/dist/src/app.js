"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_config_1 = require("./config/env.config");
const cookie_middleware_1 = require("./middleware/cookie.middleware");
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const health_routes_1 = __importDefault(require("./modules/health/health.routes"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const meta_routes_1 = __importDefault(require("./modules/integrations/meta/meta.routes"));
const shopify_routes_1 = __importDefault(require("./modules/integrations/shopify/shopify.routes"));
const app = (0, express_1.default)();
// Trust Render / Reverse Proxy
app.set('trust proxy', 1);
// Security
app.use((0, helmet_1.default)({
    contentSecurityPolicy: env_config_1.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: env_config_1.env.NODE_ENV === 'production',
}));
// CORS
app.use((0, cors_1.default)({
    origin: env_config_1.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Global Middlewares
app.use(rate_limit_middleware_1.globalRateLimiter);
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookie_middleware_1.cookieMiddleware);
// Health Check
app.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        service: 'Vytalis Intelligence API',
        environment: env_config_1.env.NODE_ENV,
        status: 'healthy',
    });
});
// API Routes
app.use('/api/v1', health_routes_1.default);
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/integrations/meta', meta_routes_1.default);
app.use('/api/v1/meta', meta_routes_1.default);
app.use('/api/v1/shopify', shopify_routes_1.default);
// 404 Handler
app.use('*', (_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// Global Error Handler
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
