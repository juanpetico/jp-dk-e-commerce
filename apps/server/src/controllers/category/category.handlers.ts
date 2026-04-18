import type { NextFunction, Request, Response } from "express";
import { categoryService } from "../../services/category.service.js";
import { AppError } from "../../middleware/error-handler.js";
import { getParam } from "../../utils/request.js";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import { assertValidationOk, parsePublishedFilter } from "./category.helpers.js";

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Authentication required", 401);
        assertValidationOk(req);

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
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isPublished = parsePublishedFilter(req.query.isPublished);
        const categories = await categoryService.getAllCategories(
            isPublished === undefined ? undefined : { isPublished }
        );

        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = getParam(req, "id");
        const category = await categoryService.getCategoryById(id);

        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = getParam(req, "slug");
        const isPublished = parsePublishedFilter(req.query.isPublished);
        const category = await categoryService.getCategoryBySlug(
            slug,
            isPublished === undefined ? undefined : { isPublished }
        );

        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertValidationOk(req);

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
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
};

export const patchCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Authentication required", 401);

        assertValidationOk(req);

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
};
