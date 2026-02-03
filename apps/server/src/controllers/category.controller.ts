import type { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service.js";
import { body, validationResult } from "express-validator";
import { AppError } from "../middleware/error-handler.js";
import { getParam } from "../utils/request.js";

// Validation rules
export const categoryValidation = [
    body("name").trim().notEmpty().withMessage("Category name is required"),
];

export const categoryController = {
    async createCategory(req: Request, res: Response, next: NextFunction) {
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

            const { name } = req.body;
            const category = await categoryService.createCategory(name);

            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await categoryService.getAllCategories();

            res.json({
                success: true,
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    },

    async getCategoryById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");
            const category = await categoryService.getCategoryById(id);

            res.json({
                success: true,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    },

    async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const slug = getParam(req, "slug");
            const category = await categoryService.getCategoryBySlug(slug);

            res.json({
                success: true,
                data: category,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateCategory(req: Request, res: Response, next: NextFunction) {
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

            const id = getParam(req, "id");
            const { name } = req.body;
            const category = await categoryService.updateCategory(id, name);

            res.json({
                success: true,
                message: "Category updated successfully",
                data: category,
            });
        } catch (error) {
            next(error);
        }
    },

    async deleteCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");
            await categoryService.deleteCategory(id);

            res.json({
                success: true,
                message: "Category deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    },
};
