import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()
export const initializeDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
          console.log('Connected to MongoDB')
    } catch (err) {
        console.error('Failed to connect to MongoDB', err)
        process.exit()
    }
}