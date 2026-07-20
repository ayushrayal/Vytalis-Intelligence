"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = exports.AuthRepository = void 0;
const user_repository_1 = require("../users/user.repository");
class AuthRepository {
    async findOrCreateGoogleUser(googleProfile) {
        let user = await user_repository_1.userRepository.findByGoogleId(googleProfile.googleId);
        if (!user) {
            user = await user_repository_1.userRepository.findByEmail(googleProfile.email);
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
            user = await user_repository_1.userRepository.create({
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
        await user_repository_1.userRepository.updateLastLogin(user._id.toString());
        return { user, isNew: false };
    }
}
exports.AuthRepository = AuthRepository;
exports.authRepository = new AuthRepository();
