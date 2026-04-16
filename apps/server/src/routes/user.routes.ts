import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import {
    userController,
    registerValidation,
    loginValidation,
    updateProfileValidation,
    addressValidation,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole, requireSuperadmin } from "../middleware/role.middleware.js";

const router: Router = Router();

// Public routes
router.post("/auth/register", registerValidation, userController.register);
router.post("/auth/login", loginValidation, userController.login);
router.post("/auth/logout", userController.logout);
router.get("/auth/session", userController.getSession);

// Protected routes (requires authentication)
router.get("/users/profile", authenticate, userController.getProfile);
router.put("/users/profile", authenticate, updateProfileValidation, userController.updateProfile);

// Address routes
router.post("/users/address", authenticate, addressValidation, userController.addAddress);
router.put("/users/address/:id", authenticate, addressValidation, userController.updateAddress);
router.delete("/users/address/:id", authenticate, userController.deleteAddress);

// Admin only routes
router.get("/users", authenticate, requireRole("ADMIN", "SUPERADMIN"), userController.getAllUsers);
router.get("/users/:id", authenticate, requireRole("ADMIN", "SUPERADMIN"), userController.getUserById);
router.delete("/users/:id", authenticate, requireRole("SUPERADMIN"), userController.deleteUser);

// SUPERADMIN-only admin user management routes
router.get("/admin/users", authenticate, requireSuperadmin, userController.listUsers);
router.patch("/admin/users/:id/role", authenticate, requireSuperadmin, userController.updateUserRole);
router.patch("/admin/users/:id/status", authenticate, requireSuperadmin, userController.updateUserStatus);

export default router;
