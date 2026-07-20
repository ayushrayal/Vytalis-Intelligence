"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const user_model_1 = require("./user.model");
class UserRepository {
    async findById(userId) {
        return user_model_1.User.findById(userId).exec();
    }
    async findByGoogleId(googleId) {
        return user_model_1.User.findOne({ googleId }).exec();
    }
    async findByEmail(email) {
        return user_model_1.User.findOne({ email: email.toLowerCase() }).exec();
    }
    async create(userData) {
        const user = new user_model_1.User(userData);
        return user.save();
    }
    async updateById(userId, updateData) {
        return user_model_1.User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).exec();
    }
    async updateLastLogin(userId) {
        await user_model_1.User.findByIdAndUpdate(userId, {
            $set: {
                lastLoginAt: new Date(),
                lastActiveAt: new Date(),
            },
        }).exec();
    }
    async updateLastActive(userId) {
        await user_model_1.User.findByIdAndUpdate(userId, {
            $set: { lastActiveAt: new Date() },
        }).exec();
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
