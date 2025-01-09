import express  from "express";
import cors from 'cors';
import dotenv from 'dotenv'
import chunkRouter from "./routes/chunks";
import cookieParser from 'cookie-parser'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000 ;

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/chunks',  chunkRouter);

app.listen(PORT , () => console.log("Running on Port : ", PORT));