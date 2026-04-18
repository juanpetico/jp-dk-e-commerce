import { Product } from '@/types';

const PREFERRED_SIZE_ORDER = ['L', 'M', 'S', 'XL', 'XXL', 'STD'];

export const formatProductPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};

export const getDefaultSelectedSize = (product: Product) => {
    const availableVariants = product.variants?.filter((variant) => variant.stock > 0) || [];

    if (availableVariants.length === 0) {
        return '';
    }

    const preferredVariant = PREFERRED_SIZE_ORDER
        .map((size) => availableVariants.find((variant) => variant.size === size))
        .find(Boolean);

    return preferredVariant?.size || availableVariants[0]?.size || '';
};

export const getImageFallbackDataUrl = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23e5e7eb' width='1' height='1'/%3E%3C/svg%3E";
};
