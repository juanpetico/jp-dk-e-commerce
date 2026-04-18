import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { createLog } from "../../audit.service.js";
import { productWithRelationsInclude } from "../product.queries.js";
import { generateSlug } from "../product.utils.js";
import type { CreateProductData } from "../product.types.js";

export const createProductUseCase = async (data: CreateProductData, actorId: string) => {
    const slug = generateSlug(data.name);

    const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    if (data.originalPrice !== undefined && data.originalPrice !== null) {
        if (data.originalPrice <= data.price) {
            throw new AppError("Precio inválido: El precio original debe ser mayor que el precio actual", 400);
        }
    }

    const product = await prisma.product.create({
        data: {
            name: data.name,
            description: data.description ?? null,
            price: data.price,
            originalPrice: data.originalPrice ?? null,
            discountPercent: data.discountPercent ?? null,
            categoryId: data.categoryId,
            isNew: data.isNew ?? true,
            isSale: data.isSale ?? false,
            isPublished: data.isPublished ?? false,
            slug,
            ...(data.images
                ? {
                    images: {
                        create: data.images.map((url) => ({ url })),
                    },
                }
                : {}),
            variants: {
                create: data.variants.map((v) => ({
                    size: v.size,
                    stock: v.stock,
                })),
            },
        },
        include: productWithRelationsInclude,
    });

    await createLog({
        actorId,
        action: "PRODUCT_CREATED",
        entityType: "PRODUCT",
        entityId: product.id,
        newValue: product.name,
        metadata: { categoryId: product.categoryId, price: product.price },
    });

    return product;
};
