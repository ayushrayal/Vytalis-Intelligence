"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = void 0;
const env_config_1 = require("../../config/env.config");
const constants_1 = require("../constants");
const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProd = env_config_1.env.NODE_ENV === 'production';
    const sameSiteOption = isProd ? 'none' : 'strict';
    res.cookie(constants_1.COOKIE_KEYS.ACCESS_TOKEN, accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: sameSiteOption,
        maxAge: constants_1.TOKEN_EXPIRY.ACCESS_TOKEN_MS,
        path: '/',
    });
    res.cookie(constants_1.COOKIE_KEYS.REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: sameSiteOption,
        maxAge: constants_1.TOKEN_EXPIRY.REFRESH_TOKEN_MS,
        path: '/',
    });
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => {
    const isProd = env_config_1.env.NODE_ENV === 'production';
    const sameSiteOption = isProd ? 'none' : 'strict';
    res.clearCookie(constants_1.COOKIE_KEYS.ACCESS_TOKEN, {
        httpOnly: true,
        secure: isProd,
        sameSite: sameSiteOption,
        path: '/',
    });
    res.clearCookie(constants_1.COOKIE_KEYS.REFRESH_TOKEN, {
        httpOnly: true,
        secure: isProd,
        sameSite: sameSiteOption,
        path: '/',
    });
};
exports.clearAuthCookies = clearAuthCookies;
