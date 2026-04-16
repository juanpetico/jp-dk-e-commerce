import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import {
    orderController,
    createOrderValidation,
} from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router: Router = Router();

// User routes
router.post("/orders", authenticate, createOrderValidation, orderController.createOrder);
router.get("/orders", authenticate, orderController.getUserOrders);
router.get("/orders/:id", authenticate, orderController.getOrderById);
router.post("/orders/:id/cancel", authenticate, orderController.cancelOrder);

// Admin only routes
router.get("/orders/all/admin", authenticate, requireRole("ADMIN", "SUPERADMIN"), orderController.getAllOrders);
router.put("/orders/:id/status", authenticate, requireRole("ADMIN", "SUPERADMIN"), orderController.updateOrderStatus);
router.post("/orders/:id/pay", authenticate, requireRole("ADMIN", "SUPERADMIN"), orderController.markOrderAsPaid);

export default router;
