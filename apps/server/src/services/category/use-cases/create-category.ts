import prisma from "../../../config/prisma.js";
import { createLog } from "../../audit.service.js";
import { generateCategorySlug, triggerStorefrontRevalidation } from "../category.utils.js";
import type { CreateCategoryInput } from "../category.types.js";

export const createCategoryUseCase = async ({ name, imageUrl, showInHero, showInMenu, isPublished }: CreateCategoryInput, actorId: string) => {
    const slug = await generateCategorySlug(name);

    const category = await prisma.category.create({
        data: {
            name,
            slug,
            imageUrl: imageUrl ?? null,
            showInHero: showInHero ?? false,
            showInMenu: showInMenu ?? true,
            isPublished: isPublished ?? true,
        },
    });

    await createLog({
        actorId,
        action: "CATEGORY_CREATED",
        entityType: "CATEGORY",
        entityId: category.id,
        newValue: category.name,
    });

    await triggerStorefrontRevalidation();

    return category;
};
