import { ProductCardImageProps } from './ProductCard.types';
import { getProductImageFallbackDataUrl } from '@/lib/product-image-fallback';

export default function ProductCardImage({
    productName,
    imageUrl,
    isHovered,
    hasImageError,
    onImageError,
}: ProductCardImageProps) {
    if (imageUrl && !hasImageError) {
        return (
            <img
                src={imageUrl}
                alt={productName}
                onError={onImageError}
                className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${
                    isHovered ? 'scale-110' : 'scale-100'
                }`}
            />
        );
    }

    return (
        <img
            src={getProductImageFallbackDataUrl()}
            alt={productName}
            className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${
                isHovered ? 'scale-110' : 'scale-100'
            }`}
        />
    );
}
