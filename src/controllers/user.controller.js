import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

dotenv.config()
const SECRET_KEY = process.env.JWT_SECRET_KEY;

// Signup function
export const signup = async (req, res) => {
  const { name, email, password } = req.body;


  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    email,
    password: hashedPassword
  });

  await newUser.save();

  return res.status(201).json({ message: 'User registered successfully' });

};

// Signin function
export const signin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, {
    expiresIn: '24h'
  });

  return res.status(200).json({ user: {_id: user._id, name: user.name, email: user.email}, token });
};