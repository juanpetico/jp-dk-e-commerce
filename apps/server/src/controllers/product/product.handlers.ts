import type { NextFunction, Request, Response } from "express";
import { productService } from "../../services/product.service.js";
import type { AuthRequest } from "../../middleware/auth.middleware.js";
import { AppError } from "../../middleware/error-handler.js";
import { getParam } from "../../utils/request.js";
import { assertValidationOk, parseProductFilters } from "./product.helpers.js";

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

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = parseProductFilters(req);
        const products = await productService.getAllProducts(filters);

        res.json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = getParam(req, "id");
        const product = await productService.getProductById(id);

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = getParam(req, "slug");
        const product = await productService.getProductBySlug(slug);

        res.json({ success: true, data: product });
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

export const addProductImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = getParam(req, "id");
        const { urls } = req.body;

        if (!Array.isArray(urls) || urls.length === 0) {
            throw new AppError("Image URLs array is required", 400);
        }

        const images = await productService.addProductImages(id, urls);

        res.status(201).json({
            success: true,
            message: "Images added successfully",
            data: images,
        });
    } catch (error) {
        next(error);
    }
};

export const removeProductImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const imageId = getParam(req, "imageId");
        await productService.removeProductImage(imageId);

        res.json({ success: true, message: "Image removed successfully" });
    } catch (error) {
        next(error);
    }
};

export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = getParam(req, "categoryId");
        const products = await productService.getProductsByCategory(categoryId);

        res.json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};
