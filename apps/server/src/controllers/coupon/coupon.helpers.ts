import type { AuthRequest } from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error-handler.js";

export const assertAuthenticated = (req: AuthRequest) => {
    if (!req.user) {
        throw new AppError("Authentication required", 401);
    }
};

export const assertAdminOrSuperadmin = (req: AuthRequest) => {
    if (!req.user || (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN")) {
        throw new AppError("No tienes permisos para realizar esta acción", 403);
    }
};

export const assertCouponId = (id: string | undefined): string => {
    if (!id) {
        throw new AppError("ID del cupón es requerido", 400);
    }
    return id;
};
