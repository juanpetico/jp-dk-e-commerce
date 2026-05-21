import Image from 'next/image';
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
            <Image
                src={imageUrl}
                alt={productName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover transition-transform duration-700 ease-in-out ${
                    isHovered ? 'scale-110' : 'scale-100'
                }`}
                onError={onImageError}
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
