import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../pg";
import { authMiddleware } from "../utils";
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AuthenticatedRequest,
} from "../types/types";

import { validateEmail, validateUsername, validatePassword } from "../utils";
export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET as string;

authRouter.get("/check-auth", authMiddleware, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  res.json({ message: "Authenticated", user: authReq.user });
});

//register new user
authRouter.post(
  "/register",
  async (
    req: Request<{}, {}, RegisterRequest>,
    res: Response<AuthResponse | { message: string }>
  ) => {
    const { email, username, password } = req.body;

    try {
      // Validate input
      const emailError = validateEmail(email);
      if (emailError) {
        return res.status(400).json({ message: emailError });
      }

      const usernameError = validateUsername(username);
      if (usernameError) {
        return res.status(400).json({ message: usernameError });
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        return res.status(400).json({ message: passwordError });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await db.query(
        "SELECT * FROM users WHERE email = $1 OR username = $2",
        [email, username]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await db.query(
        "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
        [email, username, hashedPassword]
      );
      const parsedUser = user.rows[0];

      const token = jwt.sign(
        {
          id: parsedUser.id,
          username: parsedUser.username,
          email: parsedUser.email,
        },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({ user: { ...parsedUser, token } });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user" });
    }
  }
);

//login with email and password
authRouter.post(
  "/login",
  async (
    req: Request<{}, {}, LoginRequest>,
    res: Response<AuthResponse | { message: string }>
  ) => {
    try {
      const { email, password } = req.body;

      const emailError = validateEmail(email);
      if (emailError) {
        return res.status(400).json({ message: emailError });
      }

      const result = await db.query(
        "SELECT id, username, email, password_hash FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.json({ user: { ...user, token } });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  }
);
