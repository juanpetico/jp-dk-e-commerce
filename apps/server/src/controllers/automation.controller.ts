import type { Request, Response, NextFunction } from "express";
import { automationService } from "../services/automation.service.js";
import { AppError } from "../middleware/error-handler.js";

const parsePositiveInt = (raw: unknown, fallback: number, max: number): number => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.min(Math.floor(n), max);
};

export const automationController = {
    async listAbandonedCarts(req: Request, res: Response, next: NextFunction) {
        try {
            const hoursInactive = parsePositiveInt(req.query.hoursInactive, 24, 24 * 30);
            const limit = parsePositiveInt(req.query.limit, 50, 200);
            const data = await automationService.listAbandonedCarts({ hoursInactive, limit });
            res.json({ success: true, count: data.length, data });
        } catch (error) {
            next(error);
        }
    },

    async notifyAbandonedCart(req: Request, res: Response, next: NextFunction) {
        try {
            const { cartId } = req.params;
            if (!cartId) throw new AppError("cartId required", 400);
            const cart = await automationService.notifyAbandonedCart(cartId);
            res.json({ success: true, data: { cartId: cart.id, reminderSentAt: cart.reminderSentAt } });
        } catch (error) {
            next(error);
        }
    },

    async listVipCandidates(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = parsePositiveInt(req.query.limit, 50, 200);
            const data = await automationService.listVipCandidates({ limit });
            res.json({ success: true, count: data.length, data });
        } catch (error) {
            next(error);
        }
    },

    async grantVipAccess(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            if (!userId) throw new AppError("userId required", 400);
            const result = await automationService.grantVipAccess(userId);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    async listReviewRequests(req: Request, res: Response, next: NextFunction) {
        try {
            const daysSinceDelivery = parsePositiveInt(req.query.daysSinceDelivery, 7, 180);
            const limit = parsePositiveInt(req.query.limit, 50, 200);
            const data = await automationService.listReviewRequests({ daysSinceDelivery, limit });
            res.json({ success: true, count: data.length, data });
        } catch (error) {
            next(error);
        }
    },

    async notifyReviewRequest(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            if (!orderId) throw new AppError("orderId required", 400);
            const order = await automationService.notifyReviewRequest(orderId);
            res.json({ success: true, data: { orderId: order.id, reviewRequestedAt: order.reviewRequestedAt } });
        } catch (error) {
            next(error);
        }
    },
};
