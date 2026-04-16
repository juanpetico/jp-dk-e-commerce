import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { createLog } from "./audit.service.js";

// Type definition until Prisma generates types
type Size = "S" | "M" | "L" | "XL" | "XXL" | "STD";

interface ProductVariantInput {
    size: Size;
    stock: number;
}

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .trim()
        .replace(/\s+/g, "-"); // Replace spaces with hyphens
};

interface CreateProductData {
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    categoryId: string;
    variants: ProductVariantInput[];
    isNew?: boolean;
    isSale?: boolean;
    images?: string[];
    isPublished?: boolean;
}

interface ProductFilters {
    // ... existing filters
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: Size;
    isNew?: boolean;
    isSale?: boolean;
    search?: string;
    isPublished?: boolean;
}

export const productService = {
    async createProduct(data: CreateProductData, actorId: string) {
        const slug = generateSlug(data.name);

        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        // Validate price integrity: originalPrice must be greater than price
        if (data.originalPrice !== undefined && data.originalPrice !== null) {
            if (data.originalPrice <= data.price) {
                throw new AppError("Precio inválido: El precio original debe ser mayor que el precio actual", 400);
            }
        }

        // Create product with images and variants
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
            include: {
                images: true,
                category: true,
                variants: true,
            },
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
    },

    // ... (getAllProducts, getProductById, getProductBySlug remain similar but ensure filters are correct in getAllProducts if needed)
    async getAllProducts(filters?: ProductFilters) {
        const where: any = {};

        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.price = {};
            if (filters.minPrice !== undefined) {
                where.price.gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                where.price.lte = filters.maxPrice;
            }
        }

        if (filters?.size) {
            where.variants = {
                some: {
                    size: filters.size,
                    stock: { gt: 0 }
                },
            };
        }

        if (filters?.isNew !== undefined) {
            where.isNew = filters.isNew;
        }

        if (filters?.isSale !== undefined) {
            where.isSale = filters.isSale;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
            ];
        }

        if (filters?.isPublished !== undefined) {
            where.isPublished = filters.isPublished;
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                images: true,
                category: true,
                variants: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return products;
    },

    // ... getProductById ...
    async getProductById(id: string) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                category: true,
                variants: true,
            },
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        return product;
    },

    async getProductBySlug(slug: string) {
        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                images: true,
                category: true,
                variants: true,
            },
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        return product;
    },

    async updateProduct(
        id: string,
        actorId: string,
        productData: Partial<CreateProductData> & { slug?: string }
    ) {
        // Fetch current state once — used for validation and audit diff
        const current = await prisma.product.findUnique({
            where: { id },
            include: { variants: true },
        });
        if (!current) throw new AppError("Product not found", 404);

        // Generate new slug if name is being updated
        if (productData.name && !productData.slug) {
            productData.slug = generateSlug(productData.name);
        }

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
                ...(productData.slug !== undefined ? { slug: productData.slug } : {}),
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
        const products = await prisma.product.findMany({
            where: { categoryId },
            include: {
                images: true,
                category: true,
                variants: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return products;
    },
};
