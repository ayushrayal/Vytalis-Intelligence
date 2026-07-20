"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const app_error_1 = require("../shared/errors/app-error");
const jwt_util_1 = require("../shared/utils/jwt.util");
const constants_1 = require("../shared/constants");
const requireAuth = (req, _res, next) => {
    try {
        const token = req.cookies[constants_1.COOKIE_KEYS.ACCESS_TOKEN] || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw new app_error_1.UnauthorizedError('Authentication token missing');
        }
        const payload = (0, jwt_util_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        next(new app_error_1.UnauthorizedError('Invalid or expired authentication token'));
    }
};
exports.requireAuth = requireAuth;
