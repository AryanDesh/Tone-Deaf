import express  from "express";
import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000 ;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// app.use('/api/chunks',  songRouter);

app.listen(PORT , () => console.log("Running on Port : ", PORT));