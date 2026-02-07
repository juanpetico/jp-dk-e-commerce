import type { Request, Response, NextFunction } from "express";
import { shopConfigService } from "../services/shop-config.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error-handler.js";

export const shopConfigController = {
    async getConfig(req: Request, res: Response, next: NextFunction) {
        try {
            const config = await shopConfigService.getConfig();
            res.json({
                success: true,
                data: config,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateConfig(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
                throw new AppError("No tienes permisos para realizar esta acción", 403);
            }

            const config = await shopConfigService.updateConfig(req.body);
            res.json({
                success: true,
                data: config,
            });
        } catch (error) {
            next(error);
        }
    },
};
