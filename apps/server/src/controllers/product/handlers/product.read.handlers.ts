import type { NextFunction, Request, Response } from "express";
import { productService } from "../../../services/product.service.js";
import { getParam } from "../../../utils/request.js";
import { parseProductFilters } from "../product.helpers.js";

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

export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = getParam(req, "categoryId");
        const products = await productService.getProductsByCategory(categoryId);

        res.json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};
