import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { couponController } from "../controllers/coupon.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router: ExpressRouter = Router();

// Todas las rutas de cupones requieren autenticación por ahora
router.use(authenticate);

router.post("/validate", couponController.validateCoupon);
router.get("/my-coupons", couponController.getMyCoupons);
router.get("/", couponController.getAllCoupons);
router.post("/", couponController.createCoupon);
router.patch("/:id", couponController.updateCoupon);
router.delete("/:id", couponController.deleteCoupon);

export default router;
