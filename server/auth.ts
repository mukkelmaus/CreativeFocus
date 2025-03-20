import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User, InsertUser } from "@shared/schema";

// Secret for signing JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Extended Request interface with user property
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
  return await bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns Boolean indicating if the passwords match
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 * @param user User object
 * @returns JWT token
 */
export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Middleware to authenticate a user with JWT token
 * @param req Request object
 * @param res Response object
 * @param next Next function
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from cookie or authorization header
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      // Format: "Bearer <token>"
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await storage.getUser(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * Register a new user
 * @param userData User data
 * @returns Created user object and token
 */
export async function registerUser(userData: InsertUser): Promise<{ user: User; token: string }> {
  // Check if user with the same username already exists
  const existingUser = await storage.getUserByUsername(userData.username);
  if (existingUser) {
    throw new Error("Username already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);
  
  // Create user with hashed password
  const user = await storage.createUser({
    ...userData,
    password: hashedPassword,
  });

  // Generate and return token
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
    throw new Error("Invalid credentials");
  }

  // Check password
  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate and return token
  const token = generateToken(user);
  return { user, token };
}