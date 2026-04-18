import { Product, ProductVariant } from '@/types';

const PREFERRED_SIZE_ORDER = ['L', 'M', 'S', 'XL', 'XXL', 'STD'];

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

export const getDefaultSelectedSize = (product: Product) => {
    const availableVariants = product.variants?.filter((variant) => variant.stock > 0) || [];

    if (availableVariants.length > 0) {
        const defaultVariant =
            PREFERRED_SIZE_ORDER.map((size) => availableVariants.find((variant) => variant.size === size)).find(Boolean) ||
            availableVariants[0];

        return defaultVariant?.size || '';
    }

    return product.variants?.[0]?.size || '';
};

export const isVariantOutOfStock = (variant: ProductVariant) => {
    return variant.stock <= 0;
};
