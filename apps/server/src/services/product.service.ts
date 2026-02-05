import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";

// Type definition until Prisma generates types
type Size = "S" | "M" | "L" | "XL" | "XXL";

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
    stock: number;
    categoryId: string;
    sizes: Size[];
    isNew?: boolean;
    isSale?: boolean;
    images?: string[];
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
}

export const productService = {
    async createProduct(data: CreateProductData) {
        const slug = generateSlug(data.name);

        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        // Create product with images
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description ?? null,
                price: data.price,
                originalPrice: data.originalPrice ?? null,
                stock: data.stock,
                categoryId: data.categoryId,
                sizes: data.sizes,
                isNew: data.isNew ?? true,
                isSale: data.isSale ?? false,
                slug,
                ...(data.images
                    ? {
                        images: {
                            create: data.images.map((url) => ({ url })),
                        },
                    }
                    : {}),
            },
            include: {
                images: true,
                category: true,
            },
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
            where.sizes = {
                has: filters.size,
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

        const products = await prisma.product.findMany({
            where,
            include: {
                images: true,
                category: true,
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
            },
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        return product;
    },

    async updateProduct(
        id: string,
        productData: Partial<CreateProductData> & { slug?: string }
    ) {
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

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(productData.name !== undefined ? { name: productData.name } : {}),
                ...(productData.description !== undefined ? { description: productData.description } : {}),
                ...(productData.price !== undefined ? { price: productData.price } : {}),
                ...(productData.originalPrice !== undefined ? { originalPrice: productData.originalPrice } : {}),
                ...(productData.stock !== undefined ? { stock: productData.stock } : {}),
                ...(productData.categoryId
                    ? {
                        category: {
                            connect: { id: productData.categoryId },
                        },
                    }
                    : {}),
                ...(productData.sizes !== undefined ? { sizes: productData.sizes } : {}),
                ...(productData.isNew !== undefined ? { isNew: productData.isNew } : {}),
                ...(productData.isSale !== undefined ? { isSale: productData.isSale } : {}),
                ...(productData.slug !== undefined ? { slug: productData.slug } : {}),
            },
            include: {
                images: true,
                category: true,
            },
        });

        return product;
    },

    async deleteProduct(id: string) {
        // Product images will be cascade deleted
        await prisma.product.delete({
            where: { id },
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
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return products;
    },
};
