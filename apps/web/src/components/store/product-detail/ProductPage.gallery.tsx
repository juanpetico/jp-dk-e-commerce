import ImageMagnifier from '@/components/ui/ImageMagnifier';
import { isProductNew } from '@/lib/utils';
import { ProductPageGalleryProps } from './ProductPage.types';
import { getImageFallbackDataUrl } from './ProductPage.utils';

export default function ProductPageGallery({ product, selectedImage, onSelectImage }: ProductPageGalleryProps) {
    return (
        <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-100 dark:border-gray-800">
                <ImageMagnifier
                    src={selectedImage || product.images?.[0]?.url || getImageFallbackDataUrl()}
                    alt={product.name}
                    className="w-full h-full"
                />

                <div className="absolute top-0 left-0 flex flex-col items-start z-10">
                    {isProductNew(product.createdAt) && (
                        <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-widest pointer-events-none">
                            New
                        </span>
                    )}
                    {product.isSale && (
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest pointer-events-none">
                            Sale
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {product.images?.map((image, index) => (
                    <button
                        key={image.id || index}
                        onClick={() => onSelectImage(image.url)}
                        className={`aspect-square bg-gray-100 rounded border overflow-hidden transition-all ${
                            selectedImage === image.url
                                ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        <img
                            src={image.url}
                            alt={`${product.name} view ${index + 1}`}
                            className={`w-full h-full object-cover transition-opacity ${
                                selectedImage === image.url ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                            }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
