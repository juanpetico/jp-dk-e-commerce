'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { isProductNew } from '@/lib/utils';
import { useCart } from '@/store/CartContext';
import { LookbookCardProps } from './LookbookCarousel.types';
import { getFallbackImageDataUrl } from './LookbookCarousel.utils';

export default function LookbookCard({ product }: LookbookCardProps) {
    const { addToCart, toggleCart, cart } = useCart();
    const [selectedSize, setSelectedSize] = useState<string>(() => {
        const firstAvailable = product.variants?.find((variant) => variant.stock > 0);
        return firstAvailable?.size || product.variants?.[0]?.size || '';
    });

    const isInCart = cart.some((item) => item.id === product.id);
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    const handleAddToCart = () => {
        if (isInCart) {
            toggleCart();
            return;
        }

        if (selectedSize) {
            void addToCart(product, selectedSize);
        }
    };

    return (
        <div className="flex-none w-[85vw] md:w-[400px] snap-center flex flex-col group">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 mb-4">
                <Link href={`/product/${product.slug}`}>
                    <img
                        src={product.images?.[0]?.url || getFallbackImageDataUrl()}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                </Link>

                <div className="absolute top-0 left-0 flex flex-col items-start z-10">
                    {isProductNew(product.createdAt) && (
                        <span className="bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest pointer-events-none">
                            New
                        </span>
                    )}
                    {product.isSale && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest pointer-events-none">
                            Sale
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-display font-bold uppercase text-sm tracking-widest group-hover:underline transition-all">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2">
                    {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                    <span className="font-bold text-sm">{formatPrice(product.price)}</span>
                </div>

                <div className="flex wrap gap-1 my-1">
                    {product.variants?.map((variant) => {
                        const isOutOfStock = variant.stock <= 0;

                        return (
                            <button
                                key={variant.size}
                                disabled={isOutOfStock}
                                onClick={() => !isOutOfStock && setSelectedSize(variant.size)}
                                className={`w-8 h-8 flex items-center justify-center text-[10px] transition-all duration-200 border rounded-sm ${
                                    selectedSize === variant.size
                                        ? 'bg-white text-black border-white font-bold'
                                        : isOutOfStock
                                            ? 'border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50'
                                            : 'border-white/20 text-gray-400 hover:border-white hover:text-white'
                                }`}
                            >
                                {variant.size}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-2 text-left">
                    <Button
                        variant="outline"
                        className={`rounded-full shadow-md text-xs px-8 py-2.5 h-auto font-bold uppercase tracking-widest transition-all ${
                            isInCart
                                ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500 scale-105'
                                : 'bg-white text-black border-none hover:bg-gray-200 active:scale-95'
                        }`}
                        onClick={handleAddToCart}
                    >
                        {isInCart ? 'Ver Carrito' : 'Anadir al Carrito'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
