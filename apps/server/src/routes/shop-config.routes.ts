import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { shopConfigController } from "../controllers/shop-config.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router: Router = Router();

// Endpoint explícitamente público para clientes/guest
router.get("/public", shopConfigController.getConfig);

// Endpoint público para obtener la configuración (ej: mensajes de recompensa)
router.get("/", shopConfigController.getConfig);

// Endpoint privado para actualizar la configuración
router.patch("/", authenticate, shopConfigController.updateConfig);

export default router;
