import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { categoryWithPublishedProductsInclude } from "../category.queries.js";
import type { CategoryFilters } from "../category.types.js";

export const getCategoryBySlugUseCase = async (slug: string, filters?: CategoryFilters) => {
    const category = await prisma.category.findFirst({
        where: {
            slug,
            ...(typeof filters?.isPublished === "boolean" ? { isPublished: filters.isPublished } : {}),
        },
        include: categoryWithPublishedProductsInclude,
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    return category;
};
