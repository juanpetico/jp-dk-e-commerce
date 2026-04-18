import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { createLog } from "../../audit.service.js";
import { productWithRelationsInclude } from "../product.queries.js";
import { buildUpdateProductPayload } from "../product.mappers.js";
import { validateUpdateProductPricing } from "../product.validators.js";
import type { UpdateProductData } from "../product.types.js";

export const updateProductUseCase = async (id: string, actorId: string, productData: UpdateProductData) => {
    const current = await prisma.product.findUnique({
        where: { id },
        include: { variants: true },
    });
    if (!current) throw new AppError("Product not found", 404);

    if (productData.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: productData.categoryId },
        });

        if (!category) {
            throw new AppError("Category not found", 404);
        }
    }

    validateUpdateProductPricing(current.price, current.originalPrice, productData);

    const product = await prisma.product.update({
        where: { id },
        data: buildUpdateProductPayload(productData),
        include: productWithRelationsInclude,
    });

    if (productData.isPublished !== undefined && productData.isPublished !== current.isPublished) {
        await createLog({
            actorId,
            action: productData.isPublished ? "PRODUCT_PUBLISHED" : "PRODUCT_UNPUBLISHED",
            entityType: "PRODUCT",
            entityId: id,
            oldValue: String(current.isPublished),
            newValue: String(productData.isPublished),
            metadata: { productName: current.name },
        });
    }

    if (productData.price !== undefined && productData.price !== current.price) {
        await createLog({
            actorId,
            action: "PRODUCT_PRICE_CHANGE",
            entityType: "PRODUCT",
            entityId: id,
            oldValue: String(current.price),
            newValue: String(productData.price),
            metadata: { productName: current.name },
        });
    }

    const saleOldFields: Record<string, unknown> = {};
    const saleNewFields: Record<string, unknown> = {};
    if (productData.isSale !== undefined && productData.isSale !== current.isSale) {
        saleOldFields.isSale = current.isSale;
        saleNewFields.isSale = productData.isSale;
    }
    if (productData.originalPrice !== undefined && productData.originalPrice !== current.originalPrice) {
        saleOldFields.originalPrice = current.originalPrice;
        saleNewFields.originalPrice = productData.originalPrice;
    }
    if (productData.discountPercent !== undefined && productData.discountPercent !== current.discountPercent) {
        saleOldFields.discountPercent = current.discountPercent;
        saleNewFields.discountPercent = productData.discountPercent;
    }
    if (Object.keys(saleNewFields).length > 0) {
        await createLog({
            actorId,
            action: "PRODUCT_SALE_CHANGE",
            entityType: "PRODUCT",
            entityId: id,
            oldValue: JSON.stringify(saleOldFields),
            newValue: JSON.stringify(saleNewFields),
            metadata: { productName: current.name },
        });
    }

    if (productData.variants !== undefined) {
        const oldStock = new Map(current.variants.map((v) => [v.size, v.stock]));
        for (const v of productData.variants) {
            const prev = oldStock.get(v.size);
            if (prev === undefined || prev !== v.stock) {
                await createLog({
                    actorId,
                    action: "PRODUCT_STOCK_CHANGE",
                    entityType: "PRODUCT",
                    entityId: id,
                    oldValue: prev !== undefined ? String(prev) : null,
                    newValue: String(v.stock),
                    metadata: { size: v.size, productName: current.name },
                });
            }
        }
    }

    return product;
};
