import type { UpdateProductData } from "./product.types.js";

export const buildUpdateProductPayload = (productData: UpdateProductData) => {
    return {
        ...(productData.name !== undefined ? { name: productData.name } : {}),
        ...(productData.description !== undefined ? { description: productData.description } : {}),
        ...(productData.price !== undefined ? { price: productData.price } : {}),
        ...(productData.originalPrice !== undefined ? { originalPrice: productData.originalPrice } : {}),
        ...(productData.discountPercent !== undefined ? { discountPercent: productData.discountPercent } : {}),
        ...(productData.categoryId
            ? {
                category: {
                    connect: { id: productData.categoryId },
                },
            }
            : {}),
        ...(productData.isNew !== undefined ? { isNew: productData.isNew } : {}),
        ...(productData.isSale !== undefined ? { isSale: productData.isSale } : {}),
        ...(productData.isPublished !== undefined ? { isPublished: productData.isPublished } : {}),
        ...(productData.images
            ? {
                images: {
                    deleteMany: {},
                    create: productData.images.map((url) => ({ url })),
                },
            }
            : {}),
        ...(productData.variants !== undefined
            ? {
                variants: {
                    deleteMany: {},
                    create: productData.variants.map((v) => ({
                        size: v.size,
                        stock: v.stock,
                    })),
                },
            }
            : {}),
    };
};
