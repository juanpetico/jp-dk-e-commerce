import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { AppError } from "./error-handler.js";

export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        if (!roles.includes(req.user.role)) {
            throw new AppError("Insufficient permissions", 403);
        }

        next();
    };
};
