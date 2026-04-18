import type { NextFunction, Response } from "express";
import { productService } from "../../../services/product.service.js";
import type { AuthRequest } from "../../../middleware/auth.middleware.js";
import { AppError } from "../../../middleware/error-handler.js";
import { getParam } from "../../../utils/request.js";
import { assertValidationOk } from "../product.helpers.js";

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Authentication required", 401);
        assertValidationOk(req);

        const {
            name,
            description,
            price,
            originalPrice,
            discountPercent,
            variants,
            categoryId,
            isNew,
            isSale,
            isPublished,
            images,
        } = req.body;

        const product = await productService.createProduct(
            {
                name,
                description,
                price,
                originalPrice,
                discountPercent,
                variants,
                categoryId,
                isNew,
                isSale,
                isPublished,
                images,
            },
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Authentication required", 401);
        const id = getParam(req, "id");
        const {
            name,
            description,
            price,
            originalPrice,
            discountPercent,
            variants,
            categoryId,
            isNew,
            isSale,
            isPublished,
            images,
        } = req.body;

        const product = await productService.updateProduct(id, req.user.id, {
            name,
            description,
            price,
            originalPrice,
            discountPercent,
            variants,
            categoryId,
            isNew,
            isSale,
            isPublished,
            images,
        });

        res.json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Authentication required", 401);
        const id = getParam(req, "id");
        await productService.deleteProduct(id, req.user.id);

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};
