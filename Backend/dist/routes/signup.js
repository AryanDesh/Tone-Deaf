"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtFunc_1 = require("../utils/jwtFunc");
const zod_1 = __importDefault(require("zod"));
const signupRouter = (0, express_1.Router)();
const UserSchema = zod_1.default.object({
    username: zod_1.default.string(),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6)
});
signupRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Signing UP");
    const { username, email, password } = req.body;
    try {
        UserSchema.parse({
            username, email, password
        });
    }
    catch (e) {
        res.status(400).json({ Error: e });
        return;
    }
    const existingUser = yield db_1.prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        res.status(400).json({ message: " User Already Exists, try login or use a different email" });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const user = yield db_1.prisma.user.create({
        data: {
            username, email, password: hashedPassword
        }
    });
    const likedPlaylist = yield db_1.prisma.playlist.create({
        data: {
            name: "liked",
            userId: user.id
        }
    });
    db_1.prisma.user.update({
        where: { id: user.id },
        data: { likedId: likedPlaylist.id },
    });
    const accessToken = (0, jwtFunc_1.generateAccessToken)(user.id);
    res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 1 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ message: 'User signed up successfully ' });
}));
exports.default = signupRouter;
