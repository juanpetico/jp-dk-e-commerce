import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { createLog } from "../../audit.service.js";
import { generateCategorySlug, triggerStorefrontRevalidation } from "../category.utils.js";
import type { CategoryFieldsUpdateInput } from "../category.types.js";

export const updateCategoryFieldsUseCase = async (
    id: string,
    fields: CategoryFieldsUpdateInput,
    actorId?: string
) => {
    const existing = (await prisma.category.findUnique({ where: { id } })) as
        | ({ isPublished?: boolean; name: string; id: string; slug: string } & Record<string, unknown>)
        | null;
    if (!existing) {
        throw new AppError("Category not found", 404);
    }

    const updateData: CategoryFieldsUpdateInput & { slug?: string } = {};

    if (typeof fields.name === "string") {
        const trimmedName = fields.name.trim();
        if (!trimmedName) {
            throw new AppError("Category name is required", 400);
        }
        updateData.name = trimmedName;
        updateData.slug = await generateCategorySlug(trimmedName, id);
    }

    if (typeof fields.isPublished === "boolean") {
        updateData.isPublished = fields.isPublished;
    }

    if (typeof fields.sortOrder === "number") {
        updateData.sortOrder = fields.sortOrder;
    }

    if (typeof fields.imageUrl === "string" || fields.imageUrl === null) {
        updateData.imageUrl = fields.imageUrl;
    }

    if (typeof fields.showInHero === "boolean") {
        updateData.showInHero = fields.showInHero;
    }

    if (typeof fields.showInMenu === "boolean") {
        updateData.showInMenu = fields.showInMenu;
    }

    if (Object.keys(updateData).length === 0) {
        throw new AppError("At least one field is required", 400);
    }

    const category = await prisma.category.update({
        where: { id },
        data: updateData,
    });

    if (
        actorId &&
        typeof updateData.isPublished === "boolean" &&
        existing.isPublished !== updateData.isPublished
    ) {
        await createLog({
            actorId,
            action: updateData.isPublished ? "CATEGORY_PUBLISHED" : "CATEGORY_UNPUBLISHED",
            entityType: "CATEGORY",
            entityId: category.id,
            oldValue: String(existing.isPublished),
            newValue: String(updateData.isPublished),
            metadata: {
                categoryName: category.name,
            },
        });
    }

    if (actorId) {
        const trackedFields = ["name", "showInMenu", "showInHero", "sortOrder"] as const;
        const oldFields: Record<string, unknown> = {};
        const newFields: Record<string, unknown> = {};

        for (const field of trackedFields) {
            const next = updateData[field as keyof CategoryFieldsUpdateInput];
            if (next !== undefined && existing[field] !== next) {
                oldFields[field] = existing[field];
                newFields[field] = next;
            }
        }

        if (Object.keys(newFields).length > 0) {
            await createLog({
                actorId,
                action: "CATEGORY_UPDATED",
                entityType: "CATEGORY",
                entityId: category.id,
                oldValue: JSON.stringify(oldFields),
                newValue: JSON.stringify(newFields),
                metadata: { categoryName: category.name },
            });
        }
    }

    // Cualquier cambio de categoría (nombre, orden, hero, menú, publish, imagen)
    // puede afectar la tienda → revalidamos el storefront.
    await triggerStorefrontRevalidation();

    return category;
};
