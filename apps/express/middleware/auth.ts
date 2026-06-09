import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

let JWKS: ReturnType<typeof createRemoteJWKSet>;

function getJWKS() {
  if (!JWKS) {
    const issuer = process.env.JWT_ISSUER;
    if (!issuer) {
      throw new Error("JWT_ISSUER environment variable is required");
    }
    JWKS = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  }
  return JWKS;
}

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

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: process.env.JWT_ISSUER,
    });

    if (!payload.sub) {
      return res.status(401).json({ error: "Token missing sub claim" });
    }

    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
