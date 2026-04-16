import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { productWithRelationsInclude, publicProductCascadeWhere } from "../product.queries.js";

export const getProductByIdUseCase = async (id: string) => {
    const product = await prisma.product.findFirst({
        where: {
            id,
            ...publicProductCascadeWhere,
        },
        include: productWithRelationsInclude,
    });

    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return product;
};
