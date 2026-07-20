"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../../config/env.config");
const constants_1 = require("../constants");
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_config_1.env.JWT_ACCESS_SECRET, {
        expiresIn: constants_1.TOKEN_EXPIRY.ACCESS_TOKEN_JWT,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, env_config_1.env.JWT_REFRESH_SECRET, {
        expiresIn: constants_1.TOKEN_EXPIRY.REFRESH_TOKEN_JWT,
    });
};
exports.generateRefreshToken = generateRefreshToken;
exports.signAccessToken = exports.generateAccessToken;
exports.signRefreshToken = exports.generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_ACCESS_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
