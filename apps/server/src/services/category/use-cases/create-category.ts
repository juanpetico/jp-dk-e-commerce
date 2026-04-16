import prisma from "../../../config/prisma.js";
import { createLog } from "../../audit.service.js";
import { generateCategorySlug } from "../category.utils.js";

export const createCategoryUseCase = async (name: string, actorId: string) => {
    const slug = await generateCategorySlug(name);

    const category = await prisma.category.create({
        data: { name, slug },
    });

    await createLog({
        actorId,
        action: "CATEGORY_CREATED",
        entityType: "CATEGORY",
        entityId: category.id,
        newValue: category.name,
    });

    return category;
};
