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
import { requireRole } from "../middleware/role.middleware.js";

const router: Router = Router();

// Public routes
router.post("/auth/register", registerValidation, userController.register);
router.post("/auth/login", loginValidation, userController.login);

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

export default router;
