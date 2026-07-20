"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallbackQuerySchema = exports.refreshSchema = void 0;
const zod_1 = require("zod");
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().optional(),
});
exports.googleCallbackQuerySchema = zod_1.z.object({
    code: zod_1.z.string().optional(),
    error: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
});
