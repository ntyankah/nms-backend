// routes/userRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { signup, signin } from '../controllers/user.controller.js';
import { handleValidationErrors } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  handleValidationErrors,
  signup
);

router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').not().isEmpty().withMessage('Password is required')
  ],
  handleValidationErrors,
  signin
);

export default router;