"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = require("./env.config");
const logger_config_1 = require("./logger.config");
const connectDatabase = async () => {
    try {
        mongoose_1.default.set('strictQuery', true);
        const conn = await mongoose_1.default.connect(env_config_1.env.MONGODB_URI, {
            autoIndex: env_config_1.env.NODE_ENV !== 'production',
            serverSelectionTimeoutMS: 5000,
        });
        logger_config_1.logger.info(`MongoDB connected to host: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        logger_config_1.logger.error('Failed to connect to MongoDB', { error });
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        logger_config_1.logger.info('MongoDB disconnected cleanly');
    }
    catch (error) {
        logger_config_1.logger.error('Error disconnecting from MongoDB', { error });
    }
};
exports.disconnectDatabase = disconnectDatabase;
