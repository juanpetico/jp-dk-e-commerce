import type { NextFunction, Request, Response } from "express";
import { productService } from "../../../services/product.service.js";
import { AppError } from "../../../middleware/error-handler.js";
import { getParam } from "../../../utils/request.js";

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
