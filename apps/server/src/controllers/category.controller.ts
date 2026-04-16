import type { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/category.service.js";
import { body, validationResult } from "express-validator";
import { AppError } from "../middleware/error-handler.js";
import { getParam } from "../utils/request.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

// Validation rules
export const categoryValidation = [
    body("name").trim().notEmpty().withMessage("Category name is required"),
];

export const categoryPartialValidation = [
    body("isPublished")
        .optional()
        .isBoolean()
        .withMessage("isPublished must be a boolean"),
    body("sortOrder")
        .optional()
        .isInt()
        .withMessage("sortOrder must be an integer"),
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category name cannot be empty"),
];

export const categoryController = {
    async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError("Authentication required", 401);
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
            const category = await categoryService.createCategory(name, req.user.id);

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
            const isPublishedParam = req.query.isPublished;
            const isPublished =
                isPublishedParam === "true"
                    ? true
                    : isPublishedParam === "false"
                    ? false
                    : undefined;

            const categories = await categoryService.getAllCategories(
                isPublished === undefined ? undefined : { isPublished }
            );

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
            const isPublishedParam = req.query.isPublished;
            const isPublished =
                isPublishedParam === "true"
                    ? true
                    : isPublishedParam === "false"
                    ? false
                    : undefined;
            const category = await categoryService.getCategoryBySlug(
                slug,
                isPublished === undefined ? undefined : { isPublished }
            );

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

    async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError("Authentication required", 401);
            const id = getParam(req, "id");
            await categoryService.deleteCategory(id, req.user.id);

            res.json({
                success: true,
                message: "Category deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    },

    async patchCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new AppError("Authentication required", 401);

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
            const { name, isPublished, sortOrder } = req.body;

            const hasName = typeof name === "string";
            const hasIsPublished = typeof isPublished === "boolean";
            const hasSortOrder = typeof sortOrder === "number";

            if (!hasName && !hasIsPublished && !hasSortOrder) {
                throw new AppError("At least one valid field is required", 400);
            }

            const category = await categoryService.updateCategoryFields(
                id,
                {
                ...(hasName ? { name } : {}),
                ...(hasIsPublished ? { isPublished } : {}),
                ...(hasSortOrder ? { sortOrder } : {}),
                },
                req.user.id
            );

            res.json({
                success: true,
                message: "Category updated successfully",
                data: category,
            });
        } catch (error) {
            next(error);
        }
    },
};
