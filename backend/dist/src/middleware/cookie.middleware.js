"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieMiddleware = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.cookieMiddleware = (0, cookie_parser_1.default)();
