import { Router } from "express";
import { automationController } from "../controllers/automation.controller.js";
import { requireInternalApiKey } from "../middleware/internal-api.middleware.js";

const router: Router = Router();

// Todos los endpoints de automatización requieren x-internal-api-key (llamados por n8n u otros orquestadores).
router.use(requireInternalApiKey);

// Abandoned cart
router.get("/abandoned-carts", automationController.listAbandonedCarts);
router.post("/abandoned-carts/:cartId/notify", automationController.notifyAbandonedCart);

// VIP access
router.get("/vip-candidates", automationController.listVipCandidates);
router.post("/vip-candidates/:userId/grant", automationController.grantVipAccess);

// Review requests
router.get("/review-requests", automationController.listReviewRequests);
router.post("/review-requests/:orderId/notify", automationController.notifyReviewRequest);

export default router;
