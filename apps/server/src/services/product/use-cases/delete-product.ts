import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { createLog } from "../../audit.service.js";

export const deleteProductUseCase = async (id: string, actorId: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        select: { name: true, categoryId: true, price: true },
    });
    if (!product) throw new AppError("Product not found", 404);

    await prisma.product.delete({ where: { id } });

    await createLog({
        actorId,
        action: "PRODUCT_DELETED",
        entityType: "PRODUCT",
        entityId: id,
        oldValue: product.name,
        metadata: { categoryId: product.categoryId, price: product.price },
    });
};
