import type { CategoryFilters } from "./category.types.js";

export const buildCategoryWhere = (filters?: CategoryFilters) => {
    if (typeof filters?.isPublished === "boolean") {
        return { isPublished: filters.isPublished };
    }
    return undefined;
};

export const categoryWithCountInclude = {
    _count: {
        select: { products: true },
    },
} as const;

export const categoryWithPublishedProductsInclude = {
    products: {
        where: {
            isPublished: true,
            category: {
                isPublished: true,
            },
        },
        include: {
            images: true,
        },
    },
} as const;
