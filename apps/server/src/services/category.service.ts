import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { createLog } from "./audit.service.js";
import _slugify from "slugify";
const slugify = (_slugify as any).default || _slugify;

// Helper function to generate slug from name
const generateSlug = async (name: string, excludeId?: string): Promise<string> => {
    let slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
    });

    // Check if slug exists
    let slugExists = await prisma.category.findUnique({
        where: { slug },
    });

    // If excluding an ID (update case), and the found category is the same one, it's fine
    if (slugExists && excludeId && slugExists.id === excludeId) {
        return slug;
    }

    if (slugExists) {
        let counter = 1;
        let newSlug = `${slug}-${counter}`;
        while (await prisma.category.findUnique({ where: { slug: newSlug } })) {
            counter++;
            newSlug = `${slug}-${counter}`;
        }
        slug = newSlug;
    }

    return slug;
};

export const categoryService = {
    async createCategory(name: string, actorId: string) {
        const slug = await generateSlug(name);

        const category = await prisma.category.create({
            data: { name, slug },
        });

        await createLog({
            actorId,
            action: "CATEGORY_CREATED",
            entityType: "CATEGORY",
            entityId: category.id,
            newValue: category.name,
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
        const slug = await generateSlug(name, id);

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
            },
        });

        return category;
    },

    async deleteCategory(id: string, actorId: string) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });

        if (!category) throw new AppError("Category not found", 404);

        if (category._count.products > 0) {
            throw new AppError("Cannot delete category with existing products", 400);
        }

        await prisma.category.delete({ where: { id } });

        await createLog({
            actorId,
            action: "CATEGORY_DELETED",
            entityType: "CATEGORY",
            entityId: id,
            oldValue: category.name,
        });
    },
};
