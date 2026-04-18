import type { NextFunction, Response } from "express";
import { couponService } from "../../services/coupon.service.js";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error-handler.js";
import { getParam } from "../../utils/request.js";
import { assertAdminOrSuperadmin, assertAuthenticated, assertCouponId } from "./coupon.helpers.js";

export const validateCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        assertAuthenticated(req);

        const { code, total } = req.body;

        if (!code) {
            throw new AppError("Coupon code is required", 400);
        }

        if (total === undefined || total === null) {
            throw new AppError("Current total is required", 400);
        }

        const coupon = await couponService.validateCoupon(code, req.user!.id, total);

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
};

export const getAllCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        assertAdminOrSuperadmin(req);

        const coupons = await couponService.getAllCoupons();

        res.json({
            success: true,
            data: coupons,
        });
    } catch (error) {
        next(error);
    }
};

export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        assertAdminOrSuperadmin(req);

        const coupon = await couponService.createCoupon(req.body, req.user!.id);

        res.status(201).json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        assertAdminOrSuperadmin(req);

        const id = assertCouponId(getParam(req, "id"));
        const coupon = await couponService.updateCoupon(id, req.body, req.user!.id);

        res.json({
            success: true,
            data: coupon,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        assertAdminOrSuperadmin(req);

        const id = assertCouponId(getParam(req, "id"));
        await couponService.deleteCoupon(id, req.user!.id);

        res.json({
            success: true,
            message: "Cupón eliminado exitosamente",
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminUserCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        assertAdminOrSuperadmin(req);

        const userId = req.params.userId as string;
        if (!userId) throw new AppError("userId es requerido", 400);

        const records = await couponService.getAdminUserCoupons(userId);

        res.json({
            success: true,
            data: records.map((uc) => ({
                id: uc.id,
                isUsed: uc.isUsed,
                assignedAt: uc.assignedAt,
                coupon: uc.coupon,
            })),
        });
    } catch (error) {
        next(error);
    }
};

export const getMyCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        assertAuthenticated(req);

        const coupons = await couponService.getUserCoupons(req.user!.id);

        res.json({
            success: true,
            data: coupons.map((uc) => ({
                id: uc.id,
                assignedAt: uc.assignedAt,
                coupon: uc.coupon,
            })),
        });
    } catch (error) {
        next(error);
    }
};
