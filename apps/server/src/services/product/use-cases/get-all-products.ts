import prisma from "../../../config/prisma.js";
import { buildProductWhere, productWithRelationsInclude } from "../product.queries.js";
import type { ProductFilters } from "../product.types.js";

export const getAllProductsUseCase = async (filters?: ProductFilters) => {
    const where = buildProductWhere(filters);

    return prisma.product.findMany({
        where,
        include: productWithRelationsInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
