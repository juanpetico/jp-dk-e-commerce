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
    stock: number;
    categoryId: string;
    sizes: Size[];
    isNew?: boolean;
    images?: string[];
}

interface ProductFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: Size;
    isNew?: boolean;
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
                description: data.description,
                price: data.price,
                stock: data.stock,
                categoryId: data.categoryId,
                sizes: data.sizes,
                isNew: data.isNew ?? true,
                slug,
                images: data.images
                    ? {
                        create: data.images.map((url) => ({ url })),
                    }
                    : undefined,
            },
            include: {
                images: true,
                category: true,
            },
        });

        return product;
    },

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
        data: Partial<CreateProductData> & { slug?: string }
    ) {
        // Generate new slug if name is being updated
        if (data.name && !data.slug) {
            data.slug = generateSlug(data.name);
        }

        // Verify category exists if being updated
        if (data.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: data.categoryId },
            });

            if (!category) {
                throw new AppError("Category not found", 404);
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                categoryId: data.categoryId,
                sizes: data.sizes,
                isNew: data.isNew,
                slug: data.slug,
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
