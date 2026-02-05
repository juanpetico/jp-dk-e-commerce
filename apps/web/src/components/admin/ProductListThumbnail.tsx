import React, { useState } from 'react';
import { ProductImage } from '../../types';
import { ChevronLeft, ChevronRight, Package, Image as ImageIcon } from 'lucide-react';

interface ProductListThumbnailProps {
    images: ProductImage[];
    alt: string;
}

const ProductListThumbnail: React.FC<ProductListThumbnailProps> = ({ images, alt }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Provide safe fallbacks if images is null/undefined or empty
    const validImages = Array.isArray(images) ? images : [];

    if (validImages.length === 0) {
        return (
            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
            </div>
        );
    }

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    };

    const currentImage = validImages[currentIndex];

    if (!currentImage || !currentImage.url) {
        return (
            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
        );
    }

    return (
        <div className="relative h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 group">
            <img
                src={currentImage.url}
                alt={`${alt} - view ${currentIndex + 1}`}
                className="h-full w-full object-cover"
            />

            {validImages.length > 1 && (
                <>
                    {/* Previous Button */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/40 to-transparent pl-0.5 cursor-pointer"
                        title="Anterior"
                    >
                        <ChevronLeft className="w-4 h-4 text-white drop-shadow-sm" />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/40 to-transparent pr-0.5 cursor-pointer"
                        title="Siguiente"
                    >
                        <ChevronRight className="w-4 h-4 text-white drop-shadow-sm" />
                    </button>

                    {/* Indicator dots (optional, tiny at bottom) */}
                    <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5 pointer-events-none opacity-0 group-hover:opacity-100">
                        {validImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 w-1 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductListThumbnail;
