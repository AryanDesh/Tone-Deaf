import express  from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import chunkRouter from "./routes/chunks";
import cookieParser from 'cookie-parser'
import loginRouter from "./routes/login";
import signupRouter from "./routes/signup";
import songRouter from "./routes/songs";
import userRouter from "./routes/user";
import playlistRouter from "./routes/playlist";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000 ;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/chunks',  chunkRouter);
app.use('/api/signup', signupRouter);
app.use('/api/login', loginRouter);
app.use('/api/user', userRouter);
app.use('/api/song', songRouter);
app.use('/api/user/playlist', playlistRouter);

app.listen(PORT , () => console.log("Running on Port : ", PORT));