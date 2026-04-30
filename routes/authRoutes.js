import express from "express";
import { SignJWT } from "jose";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400);
      throw new Error("Name, email and password are required");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const user = await User.create({ name, email, password });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ id: String(user._id) })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email?.trim() || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const { default: bcrypt } = await import("bcryptjs");
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ id: String(user._id) })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
