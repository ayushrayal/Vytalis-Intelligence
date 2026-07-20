"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
const app_error_1 = require("../../shared/errors/app-error");
class UserService {
    async getUserById(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new app_error_1.NotFoundError('User not found');
        }
        return user;
    }
    async completeOnboarding(userId, plan) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new app_error_1.NotFoundError('User not found');
        }
        const now = new Date();
        const isStarter = plan === 'starter';
        const subscriptionData = isStarter
            ? {
                plan,
                status: 'trialing',
                selectedAt: now,
                trialStartsAt: now,
                trialEndsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                currentPeriodEnd: undefined,
            }
            : {
                plan,
                status: 'active',
                selectedAt: now,
                trialStartsAt: undefined,
                trialEndsAt: undefined,
                currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            };
        const updatedUser = await user_repository_1.userRepository.updateById(userId, {
            isOnboarded: true,
            onboardingStep: 4,
            subscription: subscriptionData,
            lastActiveAt: now,
        });
        if (!updatedUser) {
            throw new app_error_1.NotFoundError('User update failed');
        }
        return updatedUser;
    }
    async updatePreferences(userId, preferences) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new app_error_1.NotFoundError('User not found');
        }
        const updatedUser = await user_repository_1.userRepository.updateById(userId, {
            preferences: {
                ...user.preferences,
                ...preferences,
            },
            lastActiveAt: new Date(),
        });
        if (!updatedUser) {
            throw new app_error_1.NotFoundError('User update failed');
        }
        return updatedUser;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
