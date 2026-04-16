import type { ProductFilters } from "./product.types.js";

export const productWithRelationsInclude = {
    images: true,
    category: true,
    variants: true,
} as const;

export const buildProductWhere = (filters?: ProductFilters) => {
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
                stock: { gt: 0 },
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

    return where;
};
