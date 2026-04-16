import { Router } from "express";
import type { Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireSuperadmin } from "../middleware/role.middleware.js";
import { listLogs } from "../services/audit.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error-handler.js";

const router: Router = Router();

// GET /api/admin/audit-logs — paginated audit log (SUPERADMIN only)
// Query params: take, skip, entityType, actorId, actorQuery, createdFrom, createdTo
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

            const createdFrom = q.createdFrom ? new Date(q.createdFrom) : undefined;
            const createdTo = q.createdTo ? new Date(q.createdTo) : undefined;
            const actorQuery = q.actorQuery?.trim();

            if (createdFrom && isNaN(createdFrom.getTime())) {
                throw new AppError("createdFrom must be a valid ISO date", 400);
            }
            if (createdTo && isNaN(createdTo.getTime())) {
                throw new AppError("createdTo must be a valid ISO date", 400);
            }
            if (createdFrom && createdTo && createdFrom > createdTo) {
                throw new AppError("createdFrom must be before or equal to createdTo", 400);
            }

            const result = await listLogs({
                take,
                skip,
                ...(q.userId !== undefined ? { userId: q.userId } : {}),
                ...(q.entityType !== undefined ? { entityType: q.entityType } : {}),
                ...(q.entityId !== undefined ? { entityId: q.entityId } : {}),
                ...(q.actorId !== undefined ? { actorId: q.actorId } : {}),
                ...(actorQuery ? { actorQuery } : {}),
                ...(createdFrom ? { createdFrom } : {}),
                ...(createdTo ? { createdTo } : {}),
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
