import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import createClient from "ioredis"; // use node-redis, not ioredis
import { sockets } from "./utils/collab";
import { chunkRouter, signupRouter, loginRouter, userRouter, songRouter, playlistRouter, friendRouter } from "./routes";
import { verifyJwt } from "./utils/jwtFunc";
import { parse as parseCookie } from "cookie"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes
app.use('/api/chunks', chunkRouter);
app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/user', userRouter);
app.use('/api/song', songRouter);
app.use('/api/user/playlist', playlistRouter);
app.use('/api/friends/', friendRouter);

// Auth check
app.get('/api/me', async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const decoded = verifyJwt(token);
    res.json({ user: decoded.id });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export const server = createServer(app);

export const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: "http://localhost:5173/"
  }
});
io.of("/collab").use((socket, next) => {
  const rawCookie = socket.request.headers.cookie;
  if (!rawCookie) {
    console.log("❌ No cookie header present");
    return next(new Error("Authentication error: No cookie provided"));
  }

  const cookies = parseCookie(rawCookie); // Safe parse
  const token = cookies.accessToken; // Retrieve the accessToken

  if (!token) {
    console.log("❌ No accessToken found in parsed cookies");
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = verifyJwt(token);
    socket.userId = decoded.id;
    console.log(`✅ Socket auth successful for user ${decoded.id}`);
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return next(new Error("Authentication error: Invalid token"));
  }
});

export let pubClient: createClient | null = null;
let subClient: createClient | null = null;

async function setupSocketServer() {
  pubClient = new createClient(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  subClient = pubClient.duplicate();
  
  pubClient.on('ready', () => {
    console.log('✅ Redis pubClient connected');
    console.log(pubClient?.status);
    io.adapter(createAdapter(pubClient, subClient));
    sockets();
  });
  
  pubClient.on('error', (err) => console.error('Redis Client Error:', err));
  
  subClient.on('ready', () => {
    console.log('✅ Redis subClient connected');
  });
}
setupSocketServer();

server.listen(PORT, () => {
  console.log("Running on Port:", PORT);
});
