import type { NextFunction, Request, Response } from "express";
import { authService } from "../../../services/auth.service.js";
import { assertValidationOk, clearSessionCookie, setSessionCookie } from "../user.helpers.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);

        const { email, password, name } = req.body;
        const result = await authService.register({ email, password, name });

        setSessionCookie(res, result.token);

        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            data: {
                user: result.user,
                welcomeCoupon: result.welcomeCoupon,
            },
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

        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            data: { user: result.user },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        clearSessionCookie(res);
        res.json({ success: true, message: "Sesión cerrada" });
    } catch (error) {
        next(error);
    }
};
