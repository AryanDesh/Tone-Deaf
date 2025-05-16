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
exports.pubClient = exports.io = exports.server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = __importDefault(require("ioredis"));
const collab_1 = require("./utils/collab");
const routes_1 = require("./routes");
const jwtFunc_1 = require("./utils/jwtFunc");
const cookie_1 = require("cookie");
const search_1 = __importDefault(require("./routes/search"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
    console.error('Express error handler:', err);
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
});
app.use('/api/chunks', routes_1.chunkRouter);
app.use('/api/signup', routes_1.signupRouter);
app.use('/api/login', routes_1.loginRouter);
app.use('/api/user', routes_1.userRouter);
app.use('/api/song', routes_1.songRouter);
app.use('/api/playlist', routes_1.playlistRouter);
app.use('/api/friends/', routes_1.friendRouter);
app.use('/api/search/', search_1.default);
// Auth check
app.get('/api/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.accessToken;
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const decoded = (0, jwtFunc_1.verifyJwt)(token);
        res.json({ user: decoded.id });
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}));
exports.server = (0, node_http_1.createServer)(app);
exports.io = new socket_io_1.Server(exports.server, {
    connectionStateRecovery: {},
    cors: {
        origin: "http://localhost:5173/"
    }
});
// Socket middleware for authentication
exports.io.of("/collab").use((socket, next) => {
    try {
        const rawCookie = socket.request.headers.cookie;
        if (!rawCookie) {
            console.log("❌ No cookie header present");
            return next(new Error("Authentication error: No cookie provided"));
        }
        const cookies = (0, cookie_1.parse)(rawCookie);
        const token = cookies.accessToken;
        if (!token) {
            console.log("❌ No accessToken found in parsed cookies");
            return next(new Error("Authentication error: No token provided"));
        }
        try {
            const decoded = (0, jwtFunc_1.verifyJwt)(token);
            socket.userId = decoded.id;
            console.log(`✅ Socket auth successful for user ${decoded.id}`);
            next();
        }
        catch (err) {
            console.error("❌ JWT verification failed:", err);
            return next(new Error("Authentication error: Invalid token"));
        }
    }
    catch (error) {
        console.error("Socket middleware error:", error);
        return next(new Error("Internal server error"));
    }
});
exports.pubClient = null;
let subClient = null;
function setupSocketServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            exports.pubClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
            subClient = exports.pubClient.duplicate();
            exports.pubClient.on('ready', () => {
                console.log('✅ Redis pubClient connected');
                console.log(exports.pubClient === null || exports.pubClient === void 0 ? void 0 : exports.pubClient.status);
                try {
                    exports.io.adapter((0, redis_adapter_1.createAdapter)(exports.pubClient, subClient));
                    (0, collab_1.sockets)();
                }
                catch (error) {
                    console.error('Failed to initialize socket adapter:', error);
                }
            });
            exports.pubClient.on('error', (err) => {
                console.error('Redis pubClient Error:', err);
                // Continue running even if Redis has issues
            });
            exports.pubClient.on('reconnecting', () => {
                console.log('Redis pubClient reconnecting...');
            });
            subClient.on('ready', () => {
                console.log('✅ Redis subClient connected');
            });
            subClient.on('error', (err) => {
                console.error('Redis subClient Error:', err);
            });
            // Attempt to connect
            yield exports.pubClient.connect().catch(err => {
                console.error('Failed to connect to Redis:', err);
            });
            if (subClient) {
                yield subClient.connect().catch(err => {
                    console.error('Failed to connect subClient to Redis:', err);
                });
            }
        }
        catch (error) {
            console.error('Error in setupSocketServer:', error);
        }
    });
}
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Start server
exports.server.listen(PORT, () => {
    console.log("Running on Port:", PORT);
    setupSocketServer();
});
