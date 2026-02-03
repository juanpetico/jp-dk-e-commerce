import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error-handler.js";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("No token provided", 401);
        }

        const parts = authHeader.split(" ");
        const token = parts[1];

        if (!token) {
            throw new AppError("Invalid token format", 401);
        }

        // Verify token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new AppError("JWT secret not configured", 500);
        }

        const decoded = jwt.verify(token, jwtSecret);

        // Attach user to request
        req.user = decoded as {
            id: string;
            email: string;
            role: string;
        };
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError("Invalid token", 401));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new AppError("Token expired", 401));
        } else {
            next(error);
        }
    }
};
