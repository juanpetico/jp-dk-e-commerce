export type Size = "S" | "M" | "L" | "XL" | "XXL" | "STD";

export interface ProductVariantInput {
    size: Size;
    stock: number;
}

export interface CreateProductData {
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    categoryId: string;
    variants: ProductVariantInput[];
    isNew?: boolean;
    isSale?: boolean;
    images?: string[];
    isPublished?: boolean;
}

export interface ProductFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    size?: Size;
    isNew?: boolean;
    isSale?: boolean;
    search?: string;
    isPublished?: boolean;
}
