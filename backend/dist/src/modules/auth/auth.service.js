"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const env_config_1 = require("../../config/env.config");
const auth_repository_1 = require("./auth.repository");
const user_repository_1 = require("../users/user.repository");
const jwt_util_1 = require("../../shared/utils/jwt.util");
const redis_util_1 = require("../../shared/utils/redis.util");
const app_error_1 = require("../../shared/errors/app-error");
class AuthService {
    getGoogleClient() {
        return new google_auth_library_1.OAuth2Client(env_config_1.env.GOOGLE_CLIENT_ID, env_config_1.env.GOOGLE_CLIENT_SECRET, env_config_1.env.GOOGLE_REDIRECT_URI);
    }
    getGoogleAuthUrl() {
        const client = this.getGoogleClient();
        return client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            prompt: 'consent',
        });
    }
    async handleGoogleCallback(code) {
        let googleId = '';
        let email = '';
        let name = '';
        let avatar = '';
        if (env_config_1.env.NODE_ENV === 'development' && (code === 'mock_code' || env_config_1.env.GOOGLE_CLIENT_ID === 'mock_google_client_id')) {
            // Mock OAuth Profile for local dev testing when credentials are not configured
            googleId = 'google_mock_12345';
            email = 'dev.user@vytalis.ai';
            name = 'Vytalis Developer';
            avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
        }
        else {
            const client = this.getGoogleClient();
            const { tokens } = await client.getToken(code);
            client.setCredentials(tokens);
            if (tokens.id_token) {
                const ticket = await client.verifyIdToken({
                    idToken: tokens.id_token,
                    audience: env_config_1.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                if (payload) {
                    googleId = payload.sub;
                    email = payload.email || '';
                    name = payload.name || payload.email || 'Vytalis User';
                    avatar = payload.picture || '';
                }
            }
            if (!email || !googleId) {
                // Fallback to userinfo endpoint
                const res = await client.request({
                    url: 'https://www.googleapis.com/oauth2/v3/userinfo',
                });
                googleId = res.data.sub;
                email = res.data.email;
                name = res.data.name || 'Vytalis User';
                avatar = res.data.picture || '';
            }
        }
        if (!email || !googleId) {
            throw new app_error_1.UnauthorizedError('Failed to retrieve user profile from Google');
        }
        const { user } = await auth_repository_1.authRepository.findOrCreateGoogleUser({
            googleId,
            email,
            name,
            avatar,
        });
        const userIdStr = user._id.toString();
        const tokenId = crypto_1.default.randomUUID();
        const accessPayload = {
            userId: userIdStr,
            email: user.email,
            plan: user.subscription.plan,
        };
        const refreshPayload = {
            userId: userIdStr,
            tokenId,
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(accessPayload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(refreshPayload);
        await (0, redis_util_1.storeRefreshTokenHash)(userIdStr, refreshToken);
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
    async refreshSession(currentRefreshToken) {
        let payload;
        try {
            payload = (0, jwt_util_1.verifyRefreshToken)(currentRefreshToken);
        }
        catch (error) {
            throw new app_error_1.UnauthorizedError('Invalid or expired refresh token');
        }
        const { userId } = payload;
        const storedHash = await (0, redis_util_1.getRefreshTokenHash)(userId);
        const incomingHash = (0, redis_util_1.hashToken)(currentRefreshToken);
        if (!storedHash || storedHash !== incomingHash) {
            // Invalidate session immediately on hash mismatch (token replay detection)
            await (0, redis_util_1.deleteRefreshToken)(userId);
            throw new app_error_1.UnauthorizedError('Revoked or invalid refresh token');
        }
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            await (0, redis_util_1.deleteRefreshToken)(userId);
            throw new app_error_1.UnauthorizedError('User account no longer exists');
        }
        // Update activity
        await user_repository_1.userRepository.updateLastActive(userId);
        // Token Rotation
        const newTokenId = crypto_1.default.randomUUID();
        const accessPayload = {
            userId: user._id.toString(),
            email: user.email,
            plan: user.subscription.plan,
        };
        const refreshPayload = {
            userId: user._id.toString(),
            tokenId: newTokenId,
        };
        const newAccessToken = (0, jwt_util_1.generateAccessToken)(accessPayload);
        const newRefreshToken = (0, jwt_util_1.generateRefreshToken)(refreshPayload);
        await (0, redis_util_1.storeRefreshTokenHash)(userId, newRefreshToken);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(userId) {
        await (0, redis_util_1.deleteRefreshToken)(userId);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
