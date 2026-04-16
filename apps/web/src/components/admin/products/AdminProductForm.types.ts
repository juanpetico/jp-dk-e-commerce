import { Product } from '@/types';

export interface AdminProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (product: Partial<Product>) => void;
    initialData?: Product;
}

export interface VariantState {
    size: string;
    stock: string | number;
}

export interface FormProduct extends Omit<Partial<Product>, 'images' | 'price' | 'originalPrice' | 'variants' | 'discountPercent'> {
    images: string[];
    price: string | number;
    originalPrice?: string | number;
    variants: VariantState[];
    helperDiscount?: string | number;
    discountPercent?: number;
    isPublished: boolean;
}

export type FormErrors = Record<string, string>;

export interface ImageUrlModalState {
    isOpen: boolean;
    url: string;
    index: number | null;
}
