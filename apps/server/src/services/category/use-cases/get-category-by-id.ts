import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { categoryWithPublishedProductsInclude } from "../category.queries.js";

export const getCategoryByIdUseCase = async (id: string) => {
    const category = await prisma.category.findFirst({
        where: {
            id,
            isPublished: true,
        },
        include: categoryWithPublishedProductsInclude,
    });

    if (!category) {
        throw new AppError("Category not found", 404);
    }

    return category;
};
