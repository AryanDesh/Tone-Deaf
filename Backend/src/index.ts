import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'node:http';
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import createClient from "ioredis";
import { sockets } from "./utils/collab";
import { chunkRouter, signupRouter, loginRouter, userRouter, songRouter, playlistRouter, friendRouter } from "./routes";
import { verifyJwt } from "./utils/jwtFunc";
import { parse as parseCookie } from "cookie"; 
import { Request, Response, NextFunction } from 'express';

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

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Express error handler:', err);

  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

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

// Socket middleware for authentication
io.of("/collab").use((socket, next) => {
  try {
    const rawCookie = socket.request.headers.cookie;
    if (!rawCookie) {
      console.log("❌ No cookie header present");
      return next(new Error("Authentication error: No cookie provided"));
    }

    const cookies = parseCookie(rawCookie);
    const token = cookies.accessToken;

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
  } catch (error) {
    console.error("Socket middleware error:", error);
    return next(new Error("Internal server error"));
  }
});

export let pubClient: createClient | null = null;
let subClient: createClient | null = null;

async function setupSocketServer() {
  try {
    pubClient = new createClient(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    subClient = pubClient.duplicate();
    
    pubClient.on('ready', () => {
      console.log('✅ Redis pubClient connected');
      console.log(pubClient?.status);
      
      try {
        io.adapter(createAdapter(pubClient, subClient));
        sockets();
      } catch (error) {
        console.error('Failed to initialize socket adapter:', error);
      }
    });
    
    pubClient.on('error', (err) => {
      console.error('Redis pubClient Error:', err);
      // Continue running even if Redis has issues
    });
    
    pubClient.on('reconnecting', () => {
      console.log('Redis pubClient reconnecting...');
    });
    
    subClient.on('ready', () => {
      console.log('✅ Redis subClient connected');
    });
    
    subClient.on('error', (err) => {
      console.error('Redis subClient Error:', err);
    });
    
    // Attempt to connect
    await pubClient.connect().catch(err => {
      console.error('Failed to connect to Redis:', err);
    });
    
    if (subClient) {
      await subClient.connect().catch(err => {
        console.error('Failed to connect subClient to Redis:', err);
      });
    }
  } catch (error) {
    console.error('Error in setupSocketServer:', error);
  }
}
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
server.listen(PORT, () => {
  console.log("Running on Port:", PORT);
  setupSocketServer();
});