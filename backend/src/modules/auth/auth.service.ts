import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.config';
import { authRepository } from './auth.repository';
import { userRepository } from '../users/user.repository';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
} from '../../shared/utils/jwt.util';
import {
  storeRefreshTokenHash,
  getRefreshTokenHash,
  deleteRefreshToken,
  hashToken,
} from '../../shared/utils/redis.util';
import { UnauthorizedError } from '../../shared/errors/app-error';
import { IUser } from '../users/user.model';

export class AuthService {
  private getGoogleClient(): OAuth2Client {
    return new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
  }

  getGoogleAuthUrl(): string {
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

  async handleGoogleCallback(code: string): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    let googleId = '';
    let email = '';
    let name = '';
    let avatar = '';

    if (env.NODE_ENV === 'development' && (code === 'mock_code' || env.GOOGLE_CLIENT_ID === 'mock_google_client_id')) {
      // Mock OAuth Profile for local dev testing when credentials are not configured
      googleId = 'google_mock_12345';
      email = 'dev.user@vytalis.ai';
      name = 'Vytalis Developer';
      avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
    } else {
      const client = this.getGoogleClient();
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      if (tokens.id_token) {
        const ticket = await client.verifyIdToken({
          idToken: tokens.id_token,
          audience: env.GOOGLE_CLIENT_ID,
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
        const res = await client.request<{ sub: string; email: string; name: string; picture: string }>({
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        });
        googleId = res.data.sub;
        email = res.data.email;
        name = res.data.name || 'Vytalis User';
        avatar = res.data.picture || '';
      }
    }

    if (!email || !googleId) {
      throw new UnauthorizedError('Failed to retrieve user profile from Google');
    }

    const { user } = await authRepository.findOrCreateGoogleUser({
      googleId,
      email,
      name,
      avatar,
    });

    const userIdStr = user._id.toString();
    const tokenId = crypto.randomUUID();

    const accessPayload: JwtAccessTokenPayload = {
      userId: userIdStr,
      email: user.email,
      plan: user.subscription.plan,
    };

    const refreshPayload: JwtRefreshTokenPayload = {
      userId: userIdStr,
      tokenId,
    };

    const accessToken = generateAccessToken(accessPayload);
    const refreshToken = generateRefreshToken(refreshPayload);

    await storeRefreshTokenHash(userIdStr, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshSession(currentRefreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    let payload: JwtRefreshTokenPayload;
    try {
      payload = verifyRefreshToken(currentRefreshToken);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const { userId } = payload;
    const storedHash = await getRefreshTokenHash(userId);
    const incomingHash = hashToken(currentRefreshToken);

    if (!storedHash || storedHash !== incomingHash) {
      // Invalidate session immediately on hash mismatch (token replay detection)
      await deleteRefreshToken(userId);
      throw new UnauthorizedError('Revoked or invalid refresh token');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      await deleteRefreshToken(userId);
      throw new UnauthorizedError('User account no longer exists');
    }

    // Update activity
    await userRepository.updateLastActive(userId);

    // Token Rotation
    const newTokenId = crypto.randomUUID();
    const accessPayload: JwtAccessTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      plan: user.subscription.plan,
    };

    const refreshPayload: JwtRefreshTokenPayload = {
      userId: user._id.toString(),
      tokenId: newTokenId,
    };

    const newAccessToken = generateAccessToken(accessPayload);
    const newRefreshToken = generateRefreshToken(refreshPayload);

    await storeRefreshTokenHash(userId, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await deleteRefreshToken(userId);
  }
}

export const authService = new AuthService();
