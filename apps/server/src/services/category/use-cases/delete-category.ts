import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { createLog } from "../../audit.service.js";

export const deleteCategoryUseCase = async (id: string, actorId: string) => {
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
};
