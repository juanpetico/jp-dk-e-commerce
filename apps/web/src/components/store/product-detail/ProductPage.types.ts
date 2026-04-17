import { Product, ProductVariant } from '@/types';

export interface ProductPageGalleryProps {
    product: Product;
    selectedImage: string;
    onSelectImage: (imageUrl: string) => void;
}

export interface ProductPagePurchasePanelProps {
    product: Product;
    selectedSize: string;
    quantity: number;
    maxStock: number;
    selectedVariant?: ProductVariant;
    isAdding: boolean;
    isError: boolean;
    onSelectSize: (size: string) => void;
    onChangeQuantity: (nextQty: number) => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
}
