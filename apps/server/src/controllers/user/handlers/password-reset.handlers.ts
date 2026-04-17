import type { NextFunction, Request, Response } from "express";
import { authService } from "../../../services/auth.service.js";
import { assertValidationOk } from "../user.helpers.js";

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);
        const { email } = req.body as { email: string };
        await authService.forgotPassword(email);
        res.json({
            success: true,
            message: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
        });
    } catch (error) {
        next(error);
    }
};

export const validateResetToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.query["token"];
        if (typeof token !== "string" || token.length !== 64) {
            res.json({ valid: false, reason: "not_found" });
            return;
        }
        const result = await authService.validateResetToken(token);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);
        const { token, password } = req.body as { token: string; password: string };
        await authService.resetPassword(token, password);
        res.json({
            success: true,
            message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
        });
    } catch (error) {
        next(error);
    }
};
