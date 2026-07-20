import { userRepository } from '../users/user.repository';
import { IUser } from '../users/user.model';

export class AuthRepository {
  async findOrCreateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }): Promise<{ user: IUser; isNew: boolean }> {
    let user = await userRepository.findByGoogleId(googleProfile.googleId);

    if (!user) {
      user = await userRepository.findByEmail(googleProfile.email);
      if (user) {
        // Link existing email account to Google ID
        user.googleId = googleProfile.googleId;
        if (googleProfile.avatar && !user.avatar) {
          user.avatar = googleProfile.avatar;
        }
        user.lastLoginAt = new Date();
        user.lastActiveAt = new Date();
        await user.save();
        return { user, isNew: false };
      }

      // Create brand new user
      user = await userRepository.create({
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        name: googleProfile.name,
        avatar: googleProfile.avatar || '',
        isOnboarded: false,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      });
      return { user, isNew: true };
    }

    // Existing Google user login
    await userRepository.updateLastLogin(user._id.toString());
    return { user, isNew: false };
  }
}

export const authRepository = new AuthRepository();
