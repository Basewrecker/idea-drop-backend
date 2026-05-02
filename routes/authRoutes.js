import express from "express";
import User from "../models/User.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJwtSecret.js";
import { generateToken } from "../utils/generateToken.js";
const router = express.Router();

// @route POST ap/auth/register
// @description Register new User
// @access Public

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({ name, email, password });

    // Create Tokens

    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route POST ap/auth/register
// @description Register new User
// @access Public

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      throw new Error("Invalid credentials");
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Password is incorrect");
    }

    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route POST ap/auth/logout
// @description Logout User
// @access Private

router.post("/logout", (req, res) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.status(200).json({ message: "Logged out the user" });
});

// @route POST ap/auth/register
// @description Register new User
// @access Public (Needs valid token)

router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    console.log("Refreshing token..");

    if (!token) {
      res.status(401);
      throw new Error("No refresh token");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error("No user found");
    }

    const newAccessToken = await generateToken(
      { userId: user._id.toString() },
      "1m",
    );
    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401);
    next(err);
  }
});

export default router;
