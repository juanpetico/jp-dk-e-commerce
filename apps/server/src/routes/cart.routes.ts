import { Router } from "express";
import { cartController } from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/", cartController.addItem);
router.put("/item/:id", cartController.updateQuantity);
router.delete("/item/:id", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;
