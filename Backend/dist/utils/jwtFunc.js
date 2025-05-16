"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.generateAccessToken = void 0;
exports.decodeJwt = decodeJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const jwtPassword = process.env.JWT_SECRET || 'secret';
const refreshPassword = process.env.REFRESH_PASS || "refresh";
const UserSchema = zod_1.z.object({
    username: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
const generateAccessToken = (id) => {
    return jsonwebtoken_1.default.sign({ id: id }, jwtPassword, { expiresIn: '1d' });
};
exports.generateAccessToken = generateAccessToken;
const verifyJwt = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, jwtPassword);
    return decoded;
};
exports.verifyJwt = verifyJwt;
function decodeJwt(token) {
    try {
        return jsonwebtoken_1.default.decode(token) || false;
    }
    catch (_a) {
        return false;
    }
}
