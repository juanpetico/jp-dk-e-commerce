import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import {
    categoryController,
    categoryPartialValidation,
    categoryValidation,
} from "../controllers/category.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router: Router = Router();

// Public routes
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/:id", categoryController.getCategoryById);
router.get("/categories/slug/:slug", categoryController.getCategoryBySlug);

// Admin only routes
router.post(
    "/categories",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    categoryValidation,
    categoryController.createCategory
);
router.put(
    "/categories/:id",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    categoryValidation,
    categoryController.updateCategory
);
router.patch(
    "/categories/:id",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    categoryPartialValidation,
    categoryController.patchCategory
);
router.delete(
    "/categories/:id",
    authenticate,
    requireRole("ADMIN", "SUPERADMIN"),
    categoryController.deleteCategory
);

export default router;
