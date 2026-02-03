import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import {
    orderController,
    createOrderValidation,
} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router: ExpressRouter = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post("/orders", createOrderValidation, orderController.createOrder);
router.get("/orders", orderController.getUserOrders);
router.get("/orders/:id", orderController.getOrderById);
router.post("/orders/:id/cancel", orderController.cancelOrder);

// Admin only routes
router.get("/orders/all/admin", requireRole("ADMIN"), orderController.getAllOrders);
router.put("/orders/:id/status", requireRole("ADMIN"), orderController.updateOrderStatus);
router.post("/orders/:id/pay", requireRole("ADMIN"), orderController.markOrderAsPaid);

export default router;
