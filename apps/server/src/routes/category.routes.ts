import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import {
    categoryController,
    categoryValidation,
} from "../controllers/category.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router: ExpressRouter = Router();

// Public routes
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.get("/categories/slug/:slug", categoryController.getCategoryBySlug);

// Admin only routes
router.post(
    "/categories",
    authenticate,
    requireRole("ADMIN"),
    categoryValidation,
    categoryController.createCategory
);
router.put(
    "/categories/:id",
    authenticate,
    requireRole("ADMIN"),
    categoryValidation,
    categoryController.updateCategory
);
router.delete(
    "/categories/:id",
    authenticate,
    requireRole("ADMIN"),
    categoryController.deleteCategory
);

export default router;
