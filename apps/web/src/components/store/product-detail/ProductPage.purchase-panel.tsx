import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ProductPagePurchasePanelProps } from './ProductPage.types';
import { formatProductPrice } from './ProductPage.utils';

export default function ProductPagePurchasePanel({
    product,
    selectedSize,
    quantity,
    maxStock,
    selectedVariant,
    isAdding,
    isError,
    onSelectSize,
    onChangeQuantity,
    onAddToCart,
    onBuyNow,
}: ProductPagePurchasePanelProps) {
    return (
        <div>
            <div className="mb-6">
                <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-2 leading-tight">{product.name}</h1>
                <div className="flex items-baseline space-x-4">
                    {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-lg text-red-500 line-through">{formatProductPrice(product.originalPrice)}</p>
                    )}
                    <p className={`text-2xl font-medium ${product.isSale ? 'text-red-600' : ''}`}>{formatProductPrice(product.price)}</p>
                    <p className="text-sm text-gray-500">Impuestos incluidos.</p>
                </div>
            </div>

            <hr className="border-gray-200 mb-8" />

            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide">Talla</h3>
                    <button className="text-xs underline text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">Guia de tallas</button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {product.variants?.map((variant) => {
                        const isOutOfStock = variant.stock <= 0;
                        const isSelected = selectedSize === variant.size;

                        return (
                            <button
                                key={variant.size}
                                onClick={() => !isOutOfStock && onSelectSize(variant.size)}
                                disabled={isOutOfStock}
                                className={cn(
                                    'w-12 h-12 flex items-center justify-center border rounded-md font-bold text-sm transition-all relative overflow-hidden',
                                    isSelected
                                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-black scale-105'
                                        : isOutOfStock
                                            ? 'bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-600 border-gray-100 dark:border-zinc-800 cursor-not-allowed'
                                            : 'bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-zinc-900'
                                )}
                            >
                                {variant.size}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-full h-[1px] bg-current rotate-45 opacity-50" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={cn('mb-8 transition-opacity duration-200', selectedVariant?.stock === 0 ? 'opacity-50 pointer-events-none' : 'opacity-100')}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide">Cantidad</h3>
                    {selectedSize && (
                        <span className={cn('text-xs font-bold uppercase', maxStock <= 0 ? 'text-red-600 dark:text-red-400' : maxStock <= 5 ? 'text-orange-500' : 'text-gray-500')}>
                            {maxStock > 0 ? `${maxStock} disponibles` : 'Sin stock'}
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => onChangeQuantity(quantity - 1)}
                        disabled={quantity <= 1 || maxStock === 0}
                        className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:border-black dark:hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-black dark:text-white"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    <span className="text-lg font-bold w-12 text-center text-black dark:text-white">{quantity}</span>

                    <button
                        onClick={() => onChangeQuantity(quantity + 1)}
                        disabled={quantity >= maxStock || maxStock === 0}
                        className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:border-black dark:hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-black dark:text-white"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <Button
                    variant="outline"
                    onClick={onAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                    className={cn(
                        'w-full border-2 flex items-center justify-center gap-2 transition-all duration-300 h-12 font-bold uppercase tracking-wide',
                        !selectedVariant || selectedVariant.stock <= 0
                            ? 'bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-white dark:bg-black border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                    )}
                >
                    <AnimatePresence mode="wait">
                        {isAdding ? (
                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400 fill-current" />
                                <span>Agregado</span>
                            </motion.div>
                        ) : isError ? (
                            <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-2">
                                <X className="w-4 h-4 text-red-600 dark:text-red-400 fill-current" />
                                <span>Sin Stock</span>
                            </motion.div>
                        ) : (
                            <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                <span>{!selectedVariant || selectedVariant.stock <= 0 ? 'No disponible' : 'Agregar al carrito'}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>

                <Button
                    onClick={onBuyNow}
                    disabled={!selectedVariant || selectedVariant.stock <= 0}
                    className={cn(
                        'w-full transition-colors h-12 font-bold uppercase tracking-wide',
                        !selectedVariant || selectedVariant.stock <= 0
                            ? 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 cursor-not-allowed hover:bg-gray-200 dark:hover:bg-zinc-800'
                            : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                    )}
                >
                    Comprar ahora
                </Button>
            </div>

            <div className="mb-8 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800/50 flex items-center gap-3">
                <div className="h-8 w-auto min-w-[3rem] dark:bg-black rounded-full border flex items-center justify-center shrink-0 overflow-hidden px-3">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj7WLHnmXccsnJareD8U_7cMvz5Q7-cFserg&s" alt="Mercado Pago" className="w-full h-full object-contain p-0.5" />
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    <span className="font-bold">6 cuotas sin interes</span> de {formatProductPrice(product.price / 6)}
                </p>
            </div>

            <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
                <div>
                    <h4 className="font-bold text-black dark:text-white text-base mb-2">Descripción</h4>
                    <p className="leading-relaxed whitespace-pre-line">
                        {product.description ?? 'Acabado brillante de alta calidad. 100% Algodón Premium Heavyweight. Diseñado y confeccionado en Chile.'}
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-black dark:text-white text-base mb-2">Instrucciones de cuidado</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Lavar a máquina en ciclo bajo-normal con agua temperatura ambiente.</li>
                        <li>No usar cloro.</li>
                        <li>Secar a máquina a temperatura baja.</li>
                        <li>No exprimir.</li>
                        <li>No planchar sobre el estampado.</li>
                        <li>No lavar en seco.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
