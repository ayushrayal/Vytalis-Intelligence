"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const app_error_1 = require("../shared/errors/app-error");
const logger_config_1 = require("../config/logger.config");
const env_config_1 = require("../config/env.config");
const errorMiddleware = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    logger_config_1.logger.error(`[${req.method}] ${req.path} - Error: ${err.message}`, {
        stack: err.stack,
    });
    if (err instanceof app_error_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.constructor.name,
            },
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            },
        });
        return;
    }
    res.status(500).json({
        success: false,
        error: {
            message: env_config_1.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
            code: 'INTERNAL_SERVER_ERROR',
        },
    });
};
exports.errorMiddleware = errorMiddleware;
