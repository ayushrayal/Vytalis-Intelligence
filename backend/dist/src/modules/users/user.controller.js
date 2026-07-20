"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOnboarding = exports.getMe = void 0;
const user_service_1 = require("./user.service");
const async_handler_1 = require("../../shared/utils/async-handler");
const app_error_1 = require("../../shared/errors/app-error");
exports.getMe = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user || !req.user.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const user = await user_service_1.userService.getUserById(req.user.userId);
    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                googleId: user.googleId,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                isOnboarded: user.isOnboarded,
                lastLoginAt: user.lastLoginAt,
                lastActiveAt: user.lastActiveAt,
                subscription: user.subscription,
                connectedAccounts: user.connectedAccounts,
                preferences: user.preferences,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        },
    });
});
exports.completeOnboarding = (0, async_handler_1.asyncHandler)(async (req, res) => {
    if (!req.user || !req.user.userId) {
        throw new app_error_1.UnauthorizedError('Unauthorized');
    }
    const { plan } = req.body;
    const validPlans = ['starter', 'growth', 'agency'];
    const chosenPlan = validPlans.includes(plan) ? plan : 'starter';
    const user = await user_service_1.userService.completeOnboarding(req.user.userId, chosenPlan);
    res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
});
