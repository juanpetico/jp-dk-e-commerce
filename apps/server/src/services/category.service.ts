import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";

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

export const categoryService = {
    async createCategory(name: string) {
        const slug = generateSlug(name);

        const category = await prisma.category.create({
            data: {
                name,
                slug,
            },
        });

        return category;
    },

    async getAllCategories() {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return categories;
    },

    async getCategoryById(id: string) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        images: true,
                    },
                },
            },
        });

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        return category;
    },

    async getCategoryBySlug(slug: string) {
        const category = await prisma.category.findUnique({
            where: { slug },
            include: {
                products: {
                    include: {
                        images: true,
                    },
                },
            },
        });

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        return category;
    },

    async updateCategory(id: string, name: string) {
        const slug = generateSlug(name);

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
            },
        });

        return category;
    },

    async deleteCategory(id: string) {
        // Check if category has products
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            throw new AppError("Category not found", 404);
        }

        if (category._count.products > 0) {
            throw new AppError(
                "Cannot delete category with existing products",
                400
            );
        }

        await prisma.category.delete({
            where: { id },
        });
    },
};
