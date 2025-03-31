import express  from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { createServer } from 'node:http';
import {Server} from "socket.io";
import { sockets } from "./utils/collab";
import { chunkRouter, signupRouter, loginRouter, userRouter, songRouter, playlistRouter, friendRouter } from "./routes";

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
app.use('/api/user/friend', friendRouter);


export const server = createServer(app); 

export const io = new Server(server, {
    connectionStateRecovery: {},
    cors : {
      origin : "http://localhost:5173"
    }
})

sockets();

server.listen(PORT , () => console.log("Running on Port : ", PORT));