import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

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

    const decoded = jwt.verify(token, env.jwtSecret) as AuthUser;

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