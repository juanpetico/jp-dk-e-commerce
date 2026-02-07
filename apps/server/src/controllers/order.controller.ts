import type { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service.js";
import { cartService } from "../services/cart.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { body, validationResult } from "express-validator";
import { AppError } from "../middleware/error-handler.js";
import { getParam } from "../utils/request.js";

// Type definition until Prisma generates types
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// Validation rules
export const createOrderValidation = [
    body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),
    body("items.*.productId").notEmpty().withMessage("Product ID is required"),
    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),
    body("items.*.size")
        .isIn(["S", "M", "L", "XL", "XXL"])
        .withMessage("Invalid size"),
];

export const orderController = {
    async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError(
                    errors
                        .array()
                        .map((e) => e.msg)
                        .join(", "),
                    400
                );
            }

            if (!req.user) {
                throw new AppError("Authentication required", 401);
            }

            const { items, shippingAddressId, billingAddressId, couponCode } = req.body;
            const order = await orderService.createOrder(req.user.id, items, shippingAddressId, billingAddressId, couponCode);

            // Clear cart after successful order creation
            await cartService.clearCart(req.user.id);

            res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: order,
            });
        } catch (error) {
            next(error);
        }
    },

    async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Authentication required", 401);
            }

            const orders = await orderService.getUserOrders(req.user.id);

            res.json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    },

    async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");

            // If user is not admin, pass userId to verify ownership
            const userId = req.user?.role === "ADMIN" ? undefined : req.user?.id;
            const order = await orderService.getOrderById(id, userId);

            res.json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllOrders(req: Request, res: Response, next: NextFunction) {
        try {
            // Extraer query params
            const { status, startDate, endDate, search } = req.query;

            // Construir objeto de filtros
            const filters: {
                status?: OrderStatus;
                startDate?: Date;
                endDate?: Date;
                search?: string;
            } = {};

            // Validar y añadir status si existe
            if (status && typeof status === "string") {
                const validStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
                if (validStatuses.includes(status as OrderStatus)) {
                    filters.status = status as OrderStatus;
                }
            }

            // Parsear fechas si existen
            if (startDate && typeof startDate === "string") {
                const parsedDate = new Date(startDate);
                if (!isNaN(parsedDate.getTime())) {
                    filters.startDate = parsedDate;
                }
            }

            if (endDate && typeof endDate === "string") {
                const parsedDate = new Date(endDate);
                if (!isNaN(parsedDate.getTime())) {
                    // Añadir 23:59:59 para incluir todo el día
                    parsedDate.setHours(23, 59, 59, 999);
                    filters.endDate = parsedDate;
                }
            }

            // Añadir búsqueda si existe
            if (search && typeof search === "string" && search.trim()) {
                filters.search = search.trim();
            }

            const orders = await orderService.getAllOrders(filters);

            res.json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");
            const { status } = req.body;

            const validStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
            if (!status || !validStatuses.includes(status)) {
                throw new AppError("Invalid order status", 400);
            }

            const order = await orderService.updateOrderStatus(id, status);

            res.json({
                success: true,
                message: "Order status updated successfully",
                data: order,
            });
        } catch (error) {
            next(error);
        }
    },

    async markOrderAsPaid(req: Request, res: Response, next: NextFunction) {
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
    },

    async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");

            // If user is not admin, pass userId to verify ownership
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
    },
};
