import prisma from "../../../config/prisma.js";
import { productWithRelationsInclude } from "../product.queries.js";

export const getProductsByCategoryUseCase = async (categoryId: string) => {
    return prisma.product.findMany({
        where: { categoryId },
        include: productWithRelationsInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
