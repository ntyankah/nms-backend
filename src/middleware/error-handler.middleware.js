import dotenv from 'dotenv';

dotenv.config()
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    
    // If error is an instance of CustomError, use that status code, else fallback to 500
    const status = err.status || 500;
    
    res.status(status).json({
      message: err.message || 'Internal Server Error', // Return the error message
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
}