import express from 'express';
import cors from 'cors';
import  dotenv  from 'dotenv';
import ideaRouter from './routes/ideaRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());
app.use('/api/ideas', ideaRouter);

app.use((req,res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error)
})


app.use(errorHandler)
app.get('/', (req, res) => {
    res.json({ message: 'Idea Drop API is running' });
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
};

startServer();