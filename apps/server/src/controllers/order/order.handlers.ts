import type { NextFunction, Request, Response } from "express";
import { orderService } from "../../services/order.service.js";
import { cartService } from "../../services/cart.service.js";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error-handler.js";
import { getParam } from "../../utils/request.js";
import { assertValidationOk, isValidOrderStatus, parseOrderFilters } from "./order.helpers.js";

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);

        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { items, shippingAddressId, billingAddressId, couponCode } = req.body;
        const order = await orderService.createOrder(req.user.id, items, shippingAddressId, billingAddressId, couponCode);

        await cartService.clearCart(req.user.id);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const orders = await orderService.getUserOrders(req.user.id);

        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = getParam(req, "id");
        const userId = req.user?.role === "ADMIN" ? undefined : req.user?.id;
        const order = await orderService.getOrderById(id, userId);

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = parseOrderFilters(req);
        const orders = await orderService.getAllOrders(filters);

        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Authentication required", 401);
        const id = getParam(req, "id");
        const { status } = req.body;

        if (!status || typeof status !== "string" || !isValidOrderStatus(status)) {
            throw new AppError("Invalid order status", 400);
        }

        const order = await orderService.updateOrderStatus(id, status, req.user.id);

        res.json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const markOrderAsPaid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = getParam(req, "id");
        const order = await orderService.markOrderAsPaid(id);

        res.json({
            success: true,
            message: "Order marked as paid",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = getParam(req, "id");
        const userId = req.user?.role === "ADMIN" ? undefined : req.user?.id;
        const order = await orderService.cancelOrder(id, userId);

        res.json({
            success: true,
            message: "Order cancelled successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const getTopProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
        const topProducts = await orderService.getTopProducts(limit);

        res.json({ success: true, data: topProducts });
    } catch (error) {
        next(error);
    }
};

export const getDashboardCartFunnel = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const metrics = await orderService.getDashboardCartFunnel();
        res.json({ success: true, data: metrics });
    } catch (error) {
        next(error);
    }
};

const VALID_RETENTION_RANGES = new Set(["1D", "7D", "1M", "3M", "6M", "1Y"] as const);

export const getDashboardCustomerRetention = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rangeParam = req.query.range;
        const range =
            typeof rangeParam === "string" && VALID_RETENTION_RANGES.has(rangeParam as "1D" | "7D" | "1M" | "3M" | "6M" | "1Y")
                ? (rangeParam as "1D" | "7D" | "1M" | "3M" | "6M" | "1Y")
                : "1M";

        const metrics = await orderService.getDashboardCustomerRetention(range);
        res.json({ success: true, data: metrics });
    } catch (error) {
        next(error);
    }
};
