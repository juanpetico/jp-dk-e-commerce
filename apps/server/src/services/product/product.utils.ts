import prisma from "../../config/prisma.js";

export const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
};

/**
 * Genera un slug a partir del nombre garantizando unicidad. Si el slug base ya
 * existe en otro producto distinto de `excludeId`, agrega un sufijo num\u00e9rico.
 */
export const generateUniqueProductSlug = async (name: string, excludeId?: string): Promise<string> => {
    const base = generateSlug(name);
    let slug = base;
    let counter = 1;

    while (true) {
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (!existing || existing.id === excludeId) {
            return slug;
        }
        slug = `${base}-${counter}`;
        counter++;
    }
};
