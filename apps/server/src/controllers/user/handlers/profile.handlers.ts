import type { NextFunction, Response } from "express";
import { userService } from "../../../services/user.service.js";
import type { AuthRequest } from "../../../middleware/auth.middleware.js";
import { AppError } from "../../../middleware/error-handler.js";
import { assertValidationOk } from "../user.helpers.js";

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        const user = await userService.getUserById(req.user.id);

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        assertValidationOk(req);

        const { name, email, password, phone } = req.body;
        const user = await userService.updateUser(req.user.id, {
            name,
            email,
            password,
            phone,
        });

        res.json({
            success: true,
            message: "Perfil actualizado exitosamente",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};
