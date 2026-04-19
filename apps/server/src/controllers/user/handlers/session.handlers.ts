import type { NextFunction, Request, Response } from "express";
import { authService } from "../../../services/auth.service.js";
import { userService } from "../../../services/user.service.js";
import { clearSessionCookie } from "../user.helpers.js";

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cookieToken = req.cookies?.token as string | undefined;
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
        const token = cookieToken || bearerToken;

        if (!token) {
            res.json({ success: true, data: { authenticated: false, user: null } });
            return;
        }

        let decoded: { id: string } | null = null;
        try {
            decoded = authService.verifyToken(token) as { id: string };
        } catch {
            decoded = null;
        }

        if (!decoded?.id) {
            clearSessionCookie(res);
            res.json({ success: true, data: { authenticated: false, user: null } });
            return;
        }

        let user = null;
        try {
            user = await userService.getUserById(decoded.id);
        } catch {
            user = null;
        }

        if (!user) {
            clearSessionCookie(res);
            res.json({ success: true, data: { authenticated: false, user: null } });
            return;
        }

        res.json({ success: true, data: { authenticated: true, user } });
    } catch (error) {
        next(error);
    }
};
