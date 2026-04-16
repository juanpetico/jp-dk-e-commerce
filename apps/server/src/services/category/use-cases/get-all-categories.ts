import prisma from "../../../config/prisma.js";
import { buildCategoryWhere, categoryWithCountInclude } from "../category.queries.js";
import type { CategoryFilters } from "../category.types.js";

export const getAllCategoriesUseCase = async (filters?: CategoryFilters) => {
    const where = buildCategoryWhere(filters);

    return prisma.category.findMany({
        include: categoryWithCountInclude,
        orderBy: {
            name: "asc",
        },
        ...(where ? { where } : {}),
    });
};
