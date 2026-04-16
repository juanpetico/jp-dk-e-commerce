import { Router } from "express";
import type { Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireSuperadmin } from "../middleware/role.middleware.js";
import { listLogs } from "../services/audit.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error-handler.js";

const router: Router = Router();

// GET /api/admin/audit-logs — paginated audit log (SUPERADMIN only)
// Query params: take, skip, entityType, actorId
router.get(
    "/admin/audit-logs",
    authenticate,
    requireSuperadmin,
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const q = req.query as Record<string, string | undefined>;

            const take = q.take ? parseInt(q.take, 10) : 20;
            const skip = q.skip ? parseInt(q.skip, 10) : 0;

            if (isNaN(take) || take < 1 || take > 100) {
                throw new AppError("take must be between 1 and 100", 400);
            }
            if (isNaN(skip) || skip < 0) {
                throw new AppError("skip must be a non-negative integer", 400);
            }

            const result = await listLogs({
                take,
                skip,
                ...(q.userId !== undefined ? { userId: q.userId } : {}),
                ...(q.entityType !== undefined ? { entityType: q.entityType } : {}),
                ...(q.entityId !== undefined ? { entityId: q.entityId } : {}),
                ...(q.actorId !== undefined ? { actorId: q.actorId } : {}),
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
