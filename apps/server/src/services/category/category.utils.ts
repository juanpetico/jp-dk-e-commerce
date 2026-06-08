import prisma from "../../config/prisma.js";
import _slugify from "slugify";

const slugify = (_slugify as any).default || _slugify;

export const generateCategorySlug = async (name: string, excludeId?: string): Promise<string> => {
    let slug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
    });

    let slugExists = await prisma.category.findUnique({
        where: { slug },
    });

    if (slugExists && excludeId && slugExists.id === excludeId) {
        return slug;
    }

    if (slugExists) {
        let counter = 1;
        let newSlug = `${slug}-${counter}`;
        while (await prisma.category.findUnique({ where: { slug: newSlug } })) {
            counter++;
            newSlug = `${slug}-${counter}`;
        }
        slug = newSlug;
    }

    return slug;
};

// Re-exportado desde el util compartido para no romper imports existentes.
export { triggerStorefrontRevalidation } from "../../utils/storefront-revalidation.js";
