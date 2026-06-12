import { getRootContainer, TokenVerificationService } from "@weekly-cal/api";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }

  try {
    const tokenService = getRootContainer().get(TokenVerificationService);
    req.userId = await tokenService.verifyToken(authHeader.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
