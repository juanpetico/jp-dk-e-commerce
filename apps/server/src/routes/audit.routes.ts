import { Router } from "express";
import type { Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireSuperadmin } from "../middleware/role.middleware.js";
import { listForUser } from "../services/audit.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error-handler.js";
import { getParam } from "../utils/request.js";

const router: Router = Router();

// GET /api/admin/audit/users/:id — returns audit log for a user (SUPERADMIN only)
router.get(
    "/admin/audit/users/:id",
    authenticate,
    requireSuperadmin,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const targetUserId = getParam(req, "id");
            const limitRaw = req.query.limit as string | undefined;
            const cursor = req.query.cursor as string | undefined;
            const limit = limitRaw ? parseInt(limitRaw, 10) : 20;

            if (isNaN(limit) || limit < 1 || limit > 100) {
                throw new AppError("limit must be between 1 and 100", 400);
            }

            const result = await listForUser(targetUserId, limit, cursor);

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
