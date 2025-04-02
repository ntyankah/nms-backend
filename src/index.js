import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeDb } from './setup/dbsetup.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import userRoutes from './routes/user.route.js';
import offenceRecordRoutes from './routes/offence-record.route.js';

const allowedOrigins = ['http://localhost:5173']; // Add production URL if needed
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

// Handle OPTIONS preflight requests
app.options('*', (req, res, next) => {
  console.log('Handling OPTIONS request');
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(req, res, next);
});

// CORS configuration for all requests
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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
