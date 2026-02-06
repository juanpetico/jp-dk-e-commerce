import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import {
    productController,
    productValidation,
} from "../controllers/product.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router: ExpressRouter = Router();

// Public routes
router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);
router.get("/products/slug/:slug", productController.getProductBySlug);
router.get("/products/category/:categoryId", productController.getProductsByCategory);

// Admin only routes
router.post(
    "/products",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    productValidation,
    productController.createProduct
);
router.put(
    "/products/:id",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    productController.updateProduct
);
router.delete(
    "/products/:id",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    productController.deleteProduct
);
router.post(
    "/products/:id/images",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    productController.addProductImages
);
router.delete(
    "/products/images/:imageId",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    productController.removeProductImage
);

export default router;
