import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeDb } from './setup/dbsetup.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import userRoutes from './routes/user.route.js';
import offenceRecordRoutes from './routes/offence-record.route.js';

const allowedOrigins = ['http://localhost:5173']; // Add production frontend URL if applicable
dotenv.config();

const app = express();

// Ensure DB is initialized
let dbInitialized = false;
const initialize = async () => {
  if (!dbInitialized) {
    await initializeDb();
    dbInitialized = true;
  }
};
app.use(async (req, res, next) => {
  await initialize();
  next();
});

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow common headers
    credentials: true, // If you need cookies or auth headers
  })
);

// Middleware
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});
app.get('/api/test', (req, res) => {
  res.send('Test route works!');
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/records', offenceRecordRoutes);

// Error handler
app.use(errorHandler);

export default app;
