import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { couponController } from "../controllers/coupon.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router: Router = Router();

// Todas las rutas de cupones requieren autenticación por ahora
router.use(authenticate);

router.post("/validate", couponController.validateCoupon);
router.get("/my-coupons", couponController.getMyCoupons);

// Admin only routes
router.get("/", requireRole("ADMIN", "SUPERADMIN"), couponController.getAllCoupons);
router.post("/", requireRole("ADMIN", "SUPERADMIN"), couponController.createCoupon);
router.patch("/:id", requireRole("ADMIN", "SUPERADMIN"), couponController.updateCoupon);
router.delete("/:id", requireRole("ADMIN", "SUPERADMIN"), couponController.deleteCoupon);

export default router;
