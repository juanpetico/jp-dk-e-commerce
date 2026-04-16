import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { createLog } from "./audit.service.js";
import _slugify from "slugify";
const slugify = (_slugify as any).default || _slugify;

interface CategoryFilters {
    isPublished?: boolean;
}

interface CategoryFieldsUpdateInput {
    name?: string;
    isPublished?: boolean;
    sortOrder?: number;
}

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

    async getAllCategories(filters?: CategoryFilters) {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: {
                name: "asc",
            },
            ...(typeof filters?.isPublished === "boolean"
                ? { where: { isPublished: filters.isPublished } }
                : {}),
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

    async getCategoryBySlug(slug: string, filters?: CategoryFilters) {
        const category = await prisma.category.findFirst({
            where: {
                slug,
                ...(typeof filters?.isPublished === "boolean" ? { isPublished: filters.isPublished } : {}),
            },
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
        return this.updateCategoryFields(id, { name });
    },

    async updateCategoryFields(id: string, fields: CategoryFieldsUpdateInput, actorId?: string) {
        const existing = (await prisma.category.findUnique({ where: { id } })) as
            | ({ isPublished?: boolean; name: string; id: string; slug: string } & Record<string, unknown>)
            | null;
        if (!existing) {
            throw new AppError("Category not found", 404);
        }

        const updateData: CategoryFieldsUpdateInput & { slug?: string } = {};

        if (typeof fields.name === "string") {
            const trimmedName = fields.name.trim();
            if (!trimmedName) {
                throw new AppError("Category name is required", 400);
            }
            updateData.name = trimmedName;
            updateData.slug = await generateSlug(trimmedName, id);
        }

        if (typeof fields.isPublished === "boolean") {
            updateData.isPublished = fields.isPublished;
        }

        if (typeof fields.sortOrder === "number") {
            updateData.sortOrder = fields.sortOrder;
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError("At least one field is required", 400);
        }

        const category = await prisma.category.update({
            where: { id },
            data: updateData,
        });

        if (
            actorId &&
            typeof updateData.isPublished === "boolean" &&
            existing.isPublished !== updateData.isPublished
        ) {
            await createLog({
                actorId,
                action: updateData.isPublished ? "CATEGORY_PUBLISHED" : "CATEGORY_UNPUBLISHED",
                entityType: "CATEGORY",
                entityId: category.id,
                oldValue: String(existing.isPublished),
                newValue: String(updateData.isPublished),
            });
        }

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
