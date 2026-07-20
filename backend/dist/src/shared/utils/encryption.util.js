"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptToken = exports.encryptToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const env_config_1 = require("../../config/env.config");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
/**
 * Encrypt sensitive API tokens using AES-256-GCM
 * Format: iv:authTag:encryptedData
 */
const encryptToken = (text) => {
    const key = Buffer.from(env_config_1.env.TOKEN_ENCRYPTION_KEY, 'hex');
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};
exports.encryptToken = encryptToken;
/**
 * Decrypt sensitive API tokens using AES-256-GCM
 */
const decryptToken = (encryptedToken) => {
    const parts = encryptedToken.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted token format');
    }
    const [ivHex, authTagHex, encryptedText] = parts;
    const key = Buffer.from(env_config_1.env.TOKEN_ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.decryptToken = decryptToken;
