import type { NextFunction, Request, Response } from "express";
import { authService } from "../../../services/auth.service.js";
import {
    assertValidationOk,
    clearRefreshCookie,
    clearSessionCookie,
    setRefreshCookie,
    setSessionCookie,
} from "../user.helpers.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);

        const { email, password, name, phone } = req.body;
        const result = await authService.register({ email, password, name, phone });

        setSessionCookie(res, result.token);
        setRefreshCookie(res, result.refreshToken);

        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            data: {
                user: result.user,
                token: result.token,
                welcomeCoupon: result.welcomeCoupon,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const checkEmailAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);

        const { email } = req.body;
        const available = await authService.isEmailAvailable(email);

        res.json({
            success: true,
            data: { available },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);

        const { email, password } = req.body;
        const result = await authService.login(email, password);

        setSessionCookie(res, result.token);
        setRefreshCookie(res, result.refreshToken);

        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            data: { user: result.user, token: result.token },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = (req as Request & { cookies?: { refresh_token?: string } }).cookies?.refresh_token;
        if (refreshToken) {
            try {
                const { authService } = await import("../../../services/auth.service.js");
                // Revoke by finding user via token — best-effort, non-blocking
                const prisma = (await import("../../../config/prisma.js")).default;
                const user = await prisma.user.findUnique({ where: { refreshToken }, select: { id: true } });
                if (user) await authService.revokeRefreshToken(user.id);
            } catch {
                // Non-critical
            }
        }
        clearSessionCookie(res);
        clearRefreshCookie(res);
        res.json({ success: true, message: "Sesión cerrada" });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = (req as Request & { cookies?: { refresh_token?: string } }).cookies?.refresh_token;

        if (!refreshToken) {
            res.status(401).json({ success: false, message: "No refresh token provided" });
            return;
        }

        const result = await authService.refreshAccessToken(refreshToken);

        setSessionCookie(res, result.token);
        setRefreshCookie(res, result.refreshToken);

        res.json({
            success: true,
            data: { token: result.token },
        });
    } catch (error) {
        next(error);
    }
};
