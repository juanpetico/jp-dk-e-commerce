import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error-handler.js";
import prisma from "../config/prisma.js";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

// In-memory auth cache: keyed by userId, stores DB-verified isActive + role with TTL
interface CacheEntry {
    isActive: boolean;
    role: string;
    exp: number;
}

const activeCache = new Map<string, CacheEntry>();
const TTL = 60_000; // 60 seconds

/**
 * Invalidates the auth cache entry for a user.
 * Call this after toggling isActive or changing role so the next request re-reads from DB.
 */
export function invalidateAuthCache(userId: string): void {
    activeCache.delete(userId);
}

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    path: "/",
};

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = (req as Request & { cookies?: { token?: string } }).cookies?.token;

        if (!token) {
            throw new AppError("No token provided", 401);
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new AppError("JWT secret not configured", 500);
        }

        let decoded: { id: string; email: string; role: string };
        try {
            decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; role: string };
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new AppError("Token expired", 401);
            }
            throw new AppError("Invalid token", 401);
        }

        const now = Date.now();
        let entry = activeCache.get(decoded.id);

        if (!entry || entry.exp < now) {
            // Cache miss or expired — hit the DB
            const dbUser = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { isActive: true, role: true },
            });

            if (!dbUser) {
                res.clearCookie("token", COOKIE_OPTIONS);
                throw new AppError("Account deactivated or not found", 401);
            }

            entry = { isActive: dbUser.isActive, role: dbUser.role, exp: now + TTL };
            activeCache.set(decoded.id, entry);
        }

        if (!entry.isActive) {
            res.clearCookie("token", COOKIE_OPTIONS);
            activeCache.delete(decoded.id);
            throw new AppError("Account deactivated or not found", 401);
        }

        // Attach user — DB role wins over JWT role (prevents stale-role escalation)
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: entry.role,
        };

        next();
    } catch (error) {
        next(error);
    }
};
