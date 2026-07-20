"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String,
        default: '',
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    onboardingStep: {
        type: Number,
        default: 1,
    },
    lastLoginAt: {
        type: Date,
        default: Date.now,
    },
    lastActiveAt: {
        type: Date,
        default: Date.now,
    },
    subscription: {
        plan: {
            type: String,
            enum: ['starter', 'growth', 'agency'],
            default: 'starter',
        },
        status: {
            type: String,
            enum: ['trialing', 'active', 'past_due', 'canceled', 'expired'],
            default: 'trialing',
        },
        selectedAt: {
            type: Date,
            default: Date.now,
        },
        trialStartsAt: {
            type: Date,
            default: Date.now,
        },
        trialEndsAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days Trial
        },
        currentPeriodEnd: {
            type: Date,
            required: false,
        },
    },
    connectedAccounts: {
        metaConnected: {
            type: Boolean,
            default: false,
        },
        shopifyConnected: {
            type: Boolean,
            default: false,
        },
    },
    preferences: {
        theme: {
            type: String,
            enum: ['dark', 'light'],
            default: 'dark',
        },
        timezone: {
            type: String,
            default: 'Asia/Kolkata',
        },
    },
}, {
    timestamps: true,
});
exports.User = (0, mongoose_1.model)('User', userSchema);
