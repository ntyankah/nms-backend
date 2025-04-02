import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeDb } from './setup/dbsetup.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import userRoutes from './routes/user.route.js';
import offenceRecordRoutes from './routes/offence-record.route.js';

const allowedOrigins = ['http://localhost:5173'];
dotenv.config();

// Create the Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use(express.json()); // JSON parsing middleware

// Test heartbeat
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/records', offenceRecordRoutes);

// Error handler
app.use(errorHandler);

// Initialize the database (runs once when the module is loaded)
let dbInitialized = false;
(async () => {
  if (!dbInitialized) {
    await initializeDb();
    dbInitialized = true;
  }
})();

// Export the app for Vercel
export default app;
