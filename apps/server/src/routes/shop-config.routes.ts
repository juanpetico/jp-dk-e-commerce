import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { shopConfigController } from "../controllers/shop-config.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router: Router = Router();

// Endpoint explícitamente público para clientes/guest
router.get("/public", shopConfigController.getConfig);

// Endpoint público para obtener la configuración (ej: mensajes de recompensa)
router.get("/", shopConfigController.getConfig);

// Endpoint privado para actualizar la configuración (admin only)
router.patch("/", authenticate, requireRole("ADMIN", "SUPERADMIN"), shopConfigController.updateConfig);

export default router;
