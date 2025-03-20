import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage';
import { InsertUser, User } from '@shared/schema';

// Secret key for JWT (in production, this should be in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const TOKEN_EXPIRY = '1d'; // Token expiration time

export interface AuthRequest extends Request {
  user?: User;
}

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns Boolean indicating if the passwords match
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 * @param user User object
 * @returns JWT token
 */
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Middleware to authenticate a user with JWT token
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    
    // Get user from database
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token, user not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

/**
 * Register a new user
 * @param userData User data
 * @returns Created user object and token
 */
export async function registerUser(userData: InsertUser): Promise<{ user: User; token: string }> {
  // Hash password
  const hashedPassword = await hashPassword(userData.password);
  
  // Create user with hashed password
  const user = await storage.createUser({
    ...userData,
    password: hashedPassword
  });

  // Generate token
  const token = generateToken(user);

  return { user, token };
}

/**
 * Login a user
 * @param username Username
 * @param password Password
 * @returns User object and token
 */
export async function loginUser(username: string, password: string): Promise<{ user: User; token: string }> {
  // Find user by username
  const user = await storage.getUserByUsername(username);

  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Compare password
  const isMatch = await comparePasswords(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  // Generate token
  const token = generateToken(user);

  return { user, token };
}