import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { userService } from "../services/user.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { body, validationResult } from "express-validator";
import { AppError } from "../middleware/error-handler.js";
import { getParam } from "../utils/request.js";

// Validation rules
export const registerValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("El correo electrónico es obligatorio")
        .isEmail().withMessage("Formato de correo electrónico inválido"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("name").optional().trim().notEmpty().withMessage("El nombre no puede estar vacío"),
];

export const loginValidation = [
    body("email").trim().isEmail().normalizeEmail().withMessage("Correo electrónico inválido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

// Controller functions
export const userController = {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError(
                    errors
                        .array()
                        .map((e) => e.msg)
                        .join(", "),
                    400
                );
            }

            const { email, password, name } = req.body;
            const result = await authService.register({ email, password, name });

            res.status(201).json({
                success: true,
                message: "Usuario registrado exitosamente",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError(
                    errors
                        .array()
                        .map((e) => e.msg)
                        .join(", "),
                    400
                );
            }

            const { email, password } = req.body;
            const result = await authService.login(email, password);

            res.json({
                success: true,
                message: "Inicio de sesión exitoso",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Autenticación requerida", 401);
            }

            const user = await userService.getUserById(req.user.id);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Autenticación requerida", 401);
            }

            const { name, email, password, phone } = req.body;
            // Also update phone if provided, based on schema
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
    },

    async addAddress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Autenticación requerida", 401);
            }

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
    },

    async updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Autenticación requerida", 401);
            }

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
    },

    async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Autenticación requerida", 401);
            }

            const addressId = getParam(req, "id");
            await userService.deleteAddress(req.user.id, addressId);

            res.json({
                success: true,
                message: "Dirección eliminada exitosamente",
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userService.getAllUsers();

            res.json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");
            const user = await userService.getUserById(id);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");
            await userService.deleteUser(id);

            res.json({
                success: true,
                message: "Usuario eliminado exitosamente",
            });
        } catch (error) {
            next(error);
        }
    },
};
