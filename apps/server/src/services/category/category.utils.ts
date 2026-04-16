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

export const triggerStorefrontRevalidation = async () => {
    const revalidateUrl = process.env.STOREFRONT_REVALIDATE_URL;
    const revalidateSecret = process.env.STOREFRONT_REVALIDATE_SECRET;

    if (!revalidateUrl || !revalidateSecret) {
        return;
    }

    try {
        await fetch(revalidateUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-revalidate-secret": revalidateSecret,
            },
            body: JSON.stringify({
                paths: ["/", "/catalog"],
            }),
        });
    } catch {
        // Best effort invalidation
    }
};
