import { Product, ProductVariant } from '@/types';

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function normalizeLowStockThreshold(threshold?: number): number {
    if (!Number.isFinite(threshold)) {
        return DEFAULT_LOW_STOCK_THRESHOLD;
    }

    return Math.max(0, Math.floor(threshold as number));
}

export function isCriticalVariantStock(stock: number, threshold?: number): boolean {
    return stock <= normalizeLowStockThreshold(threshold);
}

export function isProductLowStock(product: Product, threshold?: number): boolean {
    const variants = product.variants || [];

    if (variants.length === 0) {
        return true;
    }

    return variants.some((variant) => isCriticalVariantStock(variant.stock, threshold));
}

export function getVariantStockTone(
    variant: ProductVariant,
    threshold?: number
): 'critical' | 'warning' | 'healthy' {
    const normalizedThreshold = normalizeLowStockThreshold(threshold);

    if (variant.stock <= normalizedThreshold) {
        return 'critical';
    }

    if (variant.stock < normalizedThreshold + 5) {
        return 'warning';
    }

    return 'healthy';
}
