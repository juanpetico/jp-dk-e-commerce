import type { NextFunction, Request, Response } from "express";
import { authService } from "../../services/auth.service.js";
import { userService } from "../../services/user.service.js";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error-handler.js";
import { getParam } from "../../utils/request.js";
import { assertValidationOk, clearSessionCookie, setSessionCookie } from "./user.helpers.js";

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.token as string | undefined;

        if (!token) {
            res.json({ success: true, data: { authenticated: false, user: null } });
            return;
        }

        let decoded: { id: string } | null = null;
        try {
            decoded = authService.verifyToken(token) as { id: string };
        } catch {
            decoded = null;
        }

        if (!decoded?.id) {
            clearSessionCookie(res);
            res.json({ success: true, data: { authenticated: false, user: null } });
            return;
        }

        let user = null;
        try {
            user = await userService.getUserById(decoded.id);
        } catch {
            user = null;
        }

        if (!user) {
            clearSessionCookie(res);
            res.json({ success: true, data: { authenticated: false, user: null } });
            return;
        }

        res.json({ success: true, data: { authenticated: true, user } });
    } catch (error) {
        next(error);
    }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);

        const { email, password, name } = req.body;
        const result = await authService.register({ email, password, name });

        setSessionCookie(res, result.token);

        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            data: {
                user: result.user,
                welcomeCoupon: result.welcomeCoupon,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);

        const { email, password } = req.body;
        const result = await authService.login(email, password);

        setSessionCookie(res, result.token);

        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            data: { user: result.user },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        clearSessionCookie(res);
        res.json({ success: true, message: "Sesión cerrada" });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        const user = await userService.getUserById(req.user.id);

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        assertValidationOk(req);

        const { name, email, password, phone } = req.body;
        const user = await userService.updateUser(req.user.id, {
            name,
            email,
            password,
            phone,
        });

        res.json({
            success: true,
            message: "Perfil actualizado exitosamente",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const addAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        assertValidationOk(req);

        const addressData = req.body;
        const address = await userService.addAddress(req.user.id, addressData);

        res.status(201).json({
            success: true,
            message: "Dirección agregada exitosamente",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        assertValidationOk(req);

        const addressId = getParam(req, "id");
        const addressData = req.body;
        const address = await userService.updateAddress(req.user.id, addressId, addressData);

        res.json({
            success: true,
            message: "Dirección actualizada exitosamente",
            data: address,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new AppError("Autenticación requerida", 401);
        }

        const addressId = getParam(req, "id");
        await userService.deleteAddress(req.user.id, addressId);

        res.json({ success: true, message: "Dirección eliminada exitosamente" });
    } catch (error) {
        next(error);
    }
};

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
