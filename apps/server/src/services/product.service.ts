import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { createLog } from "./audit.service.js";
import { getAllProductsUseCase } from "./product/use-cases/get-all-products.js";
import type { CreateProductData, ProductFilters, ProductVariantInput, Size } from "./product/product.types.js";
import { createProductUseCase } from "./product/use-cases/create-product.js";
import { getProductByIdUseCase } from "./product/use-cases/get-product-by-id.js";
import { getProductBySlugUseCase } from "./product/use-cases/get-product-by-slug.js";
import { getProductsByCategoryUseCase } from "./product/use-cases/get-products-by-category.js";

export const productService = {
    async createProduct(data: CreateProductData, actorId: string) {
        return createProductUseCase(data, actorId);
    },

    // ... (getAllProducts, getProductById, getProductBySlug remain similar but ensure filters are correct in getAllProducts if needed)
    async getAllProducts(filters?: ProductFilters) {
        return getAllProductsUseCase(filters);
    },

    // ... getProductById ...
    async getProductById(id: string) {
        return getProductByIdUseCase(id);
    },

    async getProductBySlug(slug: string) {
        return getProductBySlugUseCase(slug);
    },

    async updateProduct(
        id: string,
        actorId: string,
        productData: Partial<CreateProductData>
    ) {
        // Fetch current state once — used for validation and audit diff
        const current = await prisma.product.findUnique({
            where: { id },
            include: { variants: true },
        });
        if (!current) throw new AppError("Product not found", 404);

        // Verify category exists if being updated
        if (productData.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: productData.categoryId },
            });

            if (!category) {
                throw new AppError("Category not found", 404);
            }
        }

        // Validate price integrity: originalPrice must be greater than price
        if (productData.originalPrice !== undefined && productData.originalPrice !== null) {
            const priceToCheck = productData.price !== undefined ? productData.price : current.price;
            if (productData.originalPrice <= priceToCheck) {
                throw new AppError("Precio inválido: El precio original debe ser mayor que el precio actual", 400);
            }
        } else if (productData.price !== undefined) {
            if (current.originalPrice && current.originalPrice <= productData.price) {
                throw new AppError("Precio inválido: El precio original debe ser mayor que el precio actual", 400);
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
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
            },
            include: {
                images: true,
                category: true,
                variants: true,
            },
        });

        // Audit: publish/unpublish
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

        // Audit: price change
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

        // Audit: sale/offer changes
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

        // Audit: stock changes per variant
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
    },

    async deleteProduct(id: string, actorId: string) {
        const product = await prisma.product.findUnique({
            where: { id },
            select: { name: true, categoryId: true, price: true },
        });
        if (!product) throw new AppError("Product not found", 404);

        await prisma.product.delete({ where: { id } });

        await createLog({
            actorId,
            action: "PRODUCT_DELETED",
            entityType: "PRODUCT",
            entityId: id,
            oldValue: product.name,
            metadata: { categoryId: product.categoryId, price: product.price },
        });
    },

    async addProductImages(productId: string, urls: string[]) {
        // Verify product exists
        await this.getProductById(productId);

        const images = await prisma.productImage.createMany({
            data: urls.map((url) => ({
                url,
                productId,
            })),
        });

        return images;
    },

    async removeProductImage(imageId: string) {
        await prisma.productImage.delete({
            where: { id: imageId },
        });
    },

    async getProductsByCategory(categoryId: string) {
        return getProductsByCategoryUseCase(categoryId);
    },
};
