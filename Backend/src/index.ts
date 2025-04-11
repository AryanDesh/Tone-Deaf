import express  from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { createServer } from 'node:http';
import {Server} from "socket.io";
import { sockets } from "./utils/collab";
import { chunkRouter, signupRouter, loginRouter, userRouter, songRouter, playlistRouter, friendRouter } from "./routes";
import { verifyJwt } from "./utils/jwtFunc";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000 ;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true 
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/chunks',  chunkRouter);
app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/user', userRouter);
app.use('/api/song', songRouter);
app.use('/api/user/playlist', playlistRouter);
app.use('/api/friends/', friendRouter);
app.get('/api/me' , async(req, res) => {
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

})


export const server = createServer(app); 

export const io = new Server(server, {
    connectionStateRecovery: {},
    cors : {
      origin : "http://localhost:5173"
    }
})

sockets();

server.listen(PORT , () => console.log("Running on Port : ", PORT));