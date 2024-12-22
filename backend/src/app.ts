import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './utils/connectDB';
import sessionRoutes from './routes/sessionRoutes';

dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use('/api', sessionRoutes);

// Default route for testing
app.get('/', (req, res) => {
  res.send('Hello World');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
