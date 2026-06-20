import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type AuthUser = {
  userId: number;
  username: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Accesso non autorizzato." });
    }

    const token = authorizationHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ message: "Token mancante." });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Sessione non valida o scaduta." });
  }
}