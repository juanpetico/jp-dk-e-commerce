import type { Request, Response, NextFunction } from "express";
import { couponService } from "../services/coupon.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error-handler.js";

export const couponController = {
    async validateCoupon(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Authentication required", 401);
            }

            const { code, total } = req.body;

            if (!code) {
                throw new AppError("Coupon code is required", 400);
            }

            if (total === undefined || total === null) {
                throw new AppError("Current total is required", 400);
            }

            const coupon = await couponService.validateCoupon(code, req.user.id, total);

            res.json({
                success: true,
                data: {
                    id: coupon.id,
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                    description: coupon.description,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllCoupons(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
                throw new AppError("No tienes permisos para realizar esta acción", 403);
            }

            const coupons = await couponService.getAllCoupons();

            res.json({
                success: true,
                data: coupons,
            });
        } catch (error) {
            next(error);
        }
    },

    async createCoupon(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
                throw new AppError("No tienes permisos para realizar esta acción", 403);
            }

            const coupon = await couponService.createCoupon(req.body);

            res.status(201).json({
                success: true,
                data: coupon,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateCoupon(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
                throw new AppError("No tienes permisos para realizar esta acción", 403);
            }

            const { id } = req.params;
            if (!id) {
                throw new AppError("ID del cupón es requerido", 400);
            }

            const coupon = await couponService.updateCoupon(id as string, req.body);

            res.json({
                success: true,
                data: coupon,
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteCoupon(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
                throw new AppError("No tienes permisos para realizar esta acción", 403);
            }

            const { id } = req.params;
            if (!id) {
                throw new AppError("ID del cupón es requerido", 400);
            }
            await couponService.deleteCoupon(id as string);

            res.json({
                success: true,
                message: "Cupón eliminado exitosamente",
            });
        } catch (error) {
            next(error);
        }
    },

    async getMyCoupons(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Authentication required", 401);
            }

            const coupons = await couponService.getUserCoupons(req.user.id);

            res.json({
                success: true,
                data: coupons.map(uc => ({
                    id: uc.id,
                    assignedAt: uc.assignedAt,
                    coupon: uc.coupon
                })),
            });
        } catch (error) {
            next(error);
        }
    },
};
