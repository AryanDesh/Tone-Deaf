import express  from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import chunkRouter from "./routes/chunks";
import cookieParser from 'cookie-parser'
import loginRouter from "./routes/login";
import signupRouter from "./routes/signup";
import temp from "./routes/temp";
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
app.use('/api/user', loginRouter);
app.use('/api/temp', temp);

app.listen(PORT , () => console.log("Running on Port : ", PORT));