import { Product } from '@/types';
import { MouseEvent } from 'react';

export interface ProductCardProps {
    product: Product;
}

export interface ProductCardImageProps {
    productName: string;
    imageUrl?: string;
    isHovered: boolean;
    hasImageError: boolean;
    onImageError: () => void;
}

export interface ProductCardQuickAddProps {
    isHovered: boolean;
    isInCart: boolean;
    isAdding: boolean;
    onAction: (event: MouseEvent) => void;
}

export interface ProductCardSizeSelectorProps {
    selectedSize: string;
    variants: Product['variants'];
    onSelectSize: (size: string) => void;
}
