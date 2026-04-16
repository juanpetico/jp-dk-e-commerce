import type { Request } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../../middleware/error-handler.js";
import { getQuery } from "../../utils/request.js";
import type { ProductFilters, Size } from "../../services/product/product.types.js";

export const assertValidationOk = (req: Request) => {
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
};

export const parseProductFilters = (req: Request): ProductFilters => {
    const categoryId = getQuery(req, "categoryId");
    const minPriceStr = getQuery(req, "minPrice");
    const maxPriceStr = getQuery(req, "maxPrice");
    const sizeStr = getQuery(req, "size");
    const isNewStr = getQuery(req, "isNew");
    const isPublishedStr = getQuery(req, "isPublished");
    const search = getQuery(req, "search");

    const filters: ProductFilters = {};

    if (categoryId) filters.categoryId = categoryId;
    if (minPriceStr) filters.minPrice = parseInt(minPriceStr, 10);
    if (maxPriceStr) filters.maxPrice = parseInt(maxPriceStr, 10);
    if (sizeStr) filters.size = sizeStr as Size;
    if (isNewStr === "true") filters.isNew = true;
    else if (isNewStr === "false") filters.isNew = false;
    if (isPublishedStr === "true") filters.isPublished = true;
    else if (isPublishedStr === "false") filters.isPublished = false;
    if (search) filters.search = search;

    return filters;
};
