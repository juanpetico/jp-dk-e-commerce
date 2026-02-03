import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { userService } from "../services/user.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { body, validationResult } from "express-validator";
import { AppError } from "../middleware/error-handler.js";
import { getParam } from "../utils/request.js";

// Validation rules
export const registerValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
];

export const loginValidation = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
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
                message: "User registered successfully",
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
                message: "Login successful",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError("Authentication required", 401);
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
                throw new AppError("Authentication required", 401);
            }

            const { name, email, password } = req.body;
            const user = await userService.updateUser(req.user.id, {
                name,
                email,
                password,
            });

            res.json({
                success: true,
                message: "Profile updated successfully",
                data: user,
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
                message: "User deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    },
};
