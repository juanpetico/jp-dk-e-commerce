import prisma from "../../../config/prisma.js";
import { productWithRelationsInclude } from "../product.queries.js";

export const getProductsByCategoryUseCase = async (categoryId: string) => {
    return prisma.product.findMany({
        where: {
            categoryId,
            isPublished: true,
            category: {
                isPublished: true,
            },
        },
        include: productWithRelationsInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
