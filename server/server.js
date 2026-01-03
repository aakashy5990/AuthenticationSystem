import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;
connectDB();

// Auto-detect environment and set allowed origins
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction 
  ? ['https://authenticationsystem-oz6d.onrender.com'] // Update with your actual production domain
  : ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins,credentials:true}));


// API ENDPOINTS
app.get('/', (req, res) => {
    res.send(`Server is Running on this URL ===>>> http://localhost:${PORT}`)
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRoutes)

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
})