import type { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service.js";
import { body, validationResult } from "express-validator";
import { AppError } from "../middleware/error-handler.js";
import { getParam, getQuery } from "../utils/request.js";

// Type definition until Prisma generates types
type Size = "S" | "M" | "L" | "XL" | "XXL";

// Validation rules
export const productValidation = [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("price")
        .isInt({ min: 0 })
        .withMessage("Price must be a positive integer"),
    body("stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be a positive integer"),
    body("categoryId").trim().notEmpty().withMessage("Category ID is required"),
    body("sizes")
        .isArray({ min: 1 })
        .withMessage("At least one size is required"),
    body("sizes.*")
        .isIn(["S", "M", "L", "XL", "XXL"])
        .withMessage("Invalid size"),
];

export const productController = {
    async createProduct(req: Request, res: Response, next: NextFunction) {
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

            const { name, description, price, originalPrice, discountPercent, stock, categoryId, sizes, isNew, isSale, isPublished, images } =
                req.body;

            const product = await productService.createProduct({
                name,
                description,
                price,
                originalPrice,
                discountPercent,
                stock,
                categoryId,
                sizes,
                isNew,
                isSale,
                isPublished,
                images,
            });

            res.status(201).json({
                success: true,
                message: "Product created successfully",
                data: product,
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const categoryId = getQuery(req, "categoryId");
            const minPriceStr = getQuery(req, "minPrice");
            const maxPriceStr = getQuery(req, "maxPrice");
            const sizeStr = getQuery(req, "size");
            const isNewStr = getQuery(req, "isNew");
            const search = getQuery(req, "search");

            // Build filters object only with defined values
            const filters: {
                categoryId?: string;
                minPrice?: number;
                maxPrice?: number;
                size?: Size;
                isNew?: boolean;
                search?: string;
                isPublished?: boolean;
            } = {};

            if (categoryId) filters.categoryId = categoryId;
            if (minPriceStr) filters.minPrice = parseInt(minPriceStr);
            if (maxPriceStr) filters.maxPrice = parseInt(maxPriceStr);
            if (sizeStr) filters.size = sizeStr as Size;
            if (isNewStr === "true") filters.isNew = true;
            else if (isNewStr === "false") filters.isNew = false;

            const isPublishedStr = getQuery(req, "isPublished");
            if (isPublishedStr === "true") filters.isPublished = true;
            else if (isPublishedStr === "false") filters.isPublished = false;

            if (search) filters.search = search;

            const products = await productService.getAllProducts(filters);

            res.json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    },

    async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");
            const product = await productService.getProductById(id);

            res.json({
                success: true,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    },

    async getProductBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const slug = getParam(req, "slug");
            const product = await productService.getProductBySlug(slug);

            res.json({
                success: true,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");
            const { name, description, price, originalPrice, discountPercent, stock, categoryId, sizes, isNew, isSale, isPublished, images } =
                req.body;

            const product = await productService.updateProduct(id, {
                name,
                description,
                price,
                originalPrice,
                discountPercent,
                stock,
                categoryId,
                sizes,
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
    },

    async deleteProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParam(req, "id");
            await productService.deleteProduct(id);

            res.json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (error) {
            next(error);
        }
    },

    async addProductImages(req: Request, res: Response, next: NextFunction) {
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
    },

    async removeProductImage(req: Request, res: Response, next: NextFunction) {
        try {
            const imageId = getParam(req, "imageId");
            await productService.removeProductImage(imageId);

            res.json({
                success: true,
                message: "Image removed successfully",
            });
        } catch (error) {
            next(error);
        }
    },

    async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const categoryId = getParam(req, "categoryId");
            const products = await productService.getProductsByCategory(categoryId);

            res.json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    },
};
