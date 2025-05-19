import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db/connectDB.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({origin:"http://localhost:5173",credentials:true})); //allow cross-origin requests

app.use(express.json()); //allow express to parse incoming JSON data from req body
app.use(cookieParser()); //allow express to parse cookies from req headers


app.use('/api/auth',authRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port :${PORT}`);
});







