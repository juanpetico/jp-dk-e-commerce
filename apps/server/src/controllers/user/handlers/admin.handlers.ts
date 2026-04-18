import type { NextFunction, Request, Response } from "express";
import { userService } from "../../../services/user.service.js";
import type { AuthRequest } from "../../../middleware/auth.middleware.js";
import { AppError } from "../../../middleware/error-handler.js";
import { getParam } from "../../../utils/request.js";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = typeof req.query.role === "string" ? req.query.role : undefined;
        const users = await userService.getAllUsers(role ? { role } : undefined);

        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = getParam(req, "id");
        const user = await userService.getUserById(id);

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = getParam(req, "id");
        await userService.deleteUser(id);

        res.json({ success: true, message: "Usuario eliminado exitosamente" });
    } catch (error) {
        next(error);
    }
};

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const q = req.query as Record<string, string | undefined>;
        const { search, role, status, cursor, limit } = q;
        const result = await userService.getUsers({
            ...(search !== undefined ? { search } : {}),
            ...(role !== undefined ? { role } : {}),
            ...(status !== undefined ? { status } : {}),
            ...(cursor !== undefined ? { cursor } : {}),
            limit: limit ? parseInt(limit, 10) : 20,
        });

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Authentication required", 401);

        const targetId = getParam(req, "id");
        const { role } = req.body;

        if (!role || typeof role !== "string") {
            throw new AppError("Invalid role", 400);
        }

        const user = await userService.updateUserRole(req.user.id, targetId, role);

        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Authentication required", 401);

        const targetId = getParam(req, "id");
        const { isActive, deactivationReason } = req.body;

        if (typeof isActive !== "boolean") {
            throw new AppError("isActive must be a boolean", 400);
        }

        const normalizedReason =
            typeof deactivationReason === "string" ? deactivationReason.trim() : undefined;

        if (!isActive && !normalizedReason) {
            throw new AppError("deactivationReason is required when deactivating a user", 400);
        }

        const user = await userService.toggleUserStatus(
            req.user.id,
            targetId,
            isActive,
            normalizedReason
        );

        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};
