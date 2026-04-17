import { ProductCardImageProps } from './ProductCard.types';

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
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-zinc-900">
            <svg className="w-16 h-16 text-gray-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
            </svg>
        </div>
    );
}
