import type { Response, NextFunction } from "express";
import { cartService } from "../services/cart.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error-handler.js";

export const cartController = {
    async getCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError("Unauthorized", 401);
            const cart = await cartService.getCart(req.user.id);
            res.json({ success: true, data: cart });
        } catch (error) {
            next(error);
        }
    },

    async addItem(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError("Unauthorized", 401);
            const { productId, size, quantity } = req.body;

            if (!productId || !size) {
                throw new AppError("Product ID and size are required", 400);
            }

            const item = await cartService.addItem(req.user.id, productId, size, quantity);
            res.json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    },

    async updateQuantity(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError("Unauthorized", 401);
            const { id } = req.params;
            const { quantity } = req.body;

            if (typeof quantity !== 'number') {
                throw new AppError("Quantity must be a number", 400);
            }

            // Ensure id is string (params always are string, but linter might be confused)
            if (!id) throw new AppError("Item ID required", 400);

            const item = await cartService.updateQuantity(req.user.id, id as string, quantity);
            res.json({ success: true, data: item });
        } catch (error) {
            next(error);
        }
    },

    async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError("Unauthorized", 401);
            const { id } = req.params;

            await cartService.removeItem(req.user.id, id as string);
            res.json({ success: true, message: "Item removed" });
        } catch (error) {
            next(error);
        }
    },

    async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError("Unauthorized", 401);
            await cartService.clearCart(req.user.id);
            res.json({ success: true, message: "Cart cleared" });
        } catch (error) {
            next(error);
        }
    }
};
