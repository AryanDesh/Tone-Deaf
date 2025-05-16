"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwtFunc_1 = require("../utils/jwtFunc");
const auth = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        res.status(403).json({
            msg: "jwt not found"
        });
        return;
    }
    try {
        const decoded = (0, jwtFunc_1.verifyJwt)(token);
        req.userId = decoded.id;
        next();
    }
    catch (e) {
        res.status(403).json({ msg: "Invalid Token" });
    }
    return;
};
exports.default = auth;
