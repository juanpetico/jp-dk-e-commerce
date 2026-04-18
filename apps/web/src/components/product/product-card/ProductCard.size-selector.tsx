import { cn } from '@/lib/utils';
import { ProductCardSizeSelectorProps } from './ProductCard.types';
import { isVariantOutOfStock } from './ProductCard.utils';

export default function ProductCardSizeSelector({ selectedSize, variants, onSelectSize }: ProductCardSizeSelectorProps) {
    return (
        <div className="flex flex-wrap gap-1 mt-auto">
            {variants?.map((variant) => {
                const outOfStock = isVariantOutOfStock(variant);

                return (
                    <button
                        key={variant.size}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!outOfStock) {
                                onSelectSize(variant.size);
                            }
                        }}
                        disabled={outOfStock}
                        className={cn(
                            'w-10 h-8 flex items-center justify-center border text-[10px] font-bold transition-all duration-200 cursor-pointer rounded-sm hover:scale-105',
                            selectedSize === variant.size
                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                : outOfStock
                                  ? 'bg-gray-50 dark:bg-zinc-900/50 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-50'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white',
                        )}
                    >
                        {variant.size}
                    </button>
                );
            })}
        </div>
    );
}
