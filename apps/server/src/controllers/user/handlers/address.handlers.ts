import type { NextFunction, Response } from "express";
import { userService } from "../../../services/user.service.js";
import type { AuthRequest } from "../../../middleware/auth.middleware.js";
import { AppError } from "../../../middleware/error-handler.js";
import { getParam } from "../../../utils/request.js";
import { assertValidationOk } from "../user.helpers.js";

export const addAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        assertValidationOk(req);

        const addressData = req.body;
        const address = await userService.addAddress(req.user.id, addressData);

        res.status(201).json({
            success: true,
            message: "Dirección agregada exitosamente",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        assertValidationOk(req);

        const addressId = getParam(req, "id");
        const addressData = req.body;
        const address = await userService.updateAddress(req.user.id, addressId, addressData);

        res.json({
            success: true,
            message: "Dirección actualizada exitosamente",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        const addressId = getParam(req, "id");
        await userService.deleteAddress(req.user.id, addressId);

        res.json({ success: true, message: "Dirección eliminada exitosamente" });
    } catch (error) {
        next(error);
    }
};
