import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import cors from 'cors'
import { initializeDb } from './setup/dbsetup.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import userRoutes from './routes/user.route.js';
import offenceRecordRoutes from './routes/offence-record.route.js';

const allowedOrigins = ['http://localhost:5173'];
dotenv.config()
async function initializeApp () {
    const app = express();
    await initializeDb()

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

    // Middleware
    app.use(express.json()); // JSON parsing middleware

    // test heart beat
    app.get('/', (req, res) => {
      res.send('Hello, world!');
    });
    app.use('/api/users', userRoutes)
    app.use('/api/records', offenceRecordRoutes)
    app.use(errorHandler)
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
}

initializeApp()