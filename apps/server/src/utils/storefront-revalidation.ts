const DEFAULT_PATHS = ["/", "/catalog"];

/**
 * Dispara la revalidación on-demand del storefront (ISR) golpeando el endpoint
 * `/api/revalidate` de la web. Best-effort: si falta config o falla la request,
 * no rompe la operación de negocio.
 */
export const triggerStorefrontRevalidation = async (paths: string[] = DEFAULT_PATHS) => {
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
            body: JSON.stringify({ paths }),
        });
    } catch {
        // Best effort invalidation
    }
};
