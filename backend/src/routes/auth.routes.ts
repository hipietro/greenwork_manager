import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

/**
 * POST /api/auth/login
 * Authenticates the admin user.
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ message: "Username obbligatorio." });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Password obbligatoria." });
    }

    const user = await prisma.user.findUnique({
      where: {
        username: username.trim().toLowerCase(),
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Credenziali non valide." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenziali non valide." });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      getJwtSecret(),
      {
        expiresIn: "8h",
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Errore durante il login." });
  }
});

/**
 * GET /api/auth/me
 * Returns the authenticated user.
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: req.user,
  });
});

export default router;