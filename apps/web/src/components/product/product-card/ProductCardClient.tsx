"use client";

import { MouseEvent, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/store/CartContext';
import ProductCardImage from './ProductCard.image';
import ProductCardQuickAdd from './ProductCard.quick-add';
import ProductCardSizeSelector from './ProductCard.size-selector';
import { ProductCardProps } from './ProductCard.types';
import { formatPrice, getDefaultSelectedSize } from './ProductCard.utils';

export default function ProductCardClient({ product }: ProductCardProps) {
    const { addToCart, cart, toggleCart } = useCart();

    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [hasImageError, setHasImageError] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string>(() => getDefaultSelectedSize(product));

    const isInCart = cart.some((item) => item.id === product.id);

    const confirmAddition = (size: string) => {
        setIsAdding(true);
        addToCart(product, size);
        setTimeout(() => {
            setIsAdding(false);
        }, 1500);
    };

    const handleAction = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (isInCart) {
            toggleCart();
            return;
        }

        if (selectedSize) {
            confirmAddition(selectedSize);
        }
    };

    return (
        <div
            className="group flex flex-col h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                <Link href={`/product/${product.slug}`} className="block w-full h-full">
                    <ProductCardImage
                        productName={product.name}
                        imageUrl={product.images?.[0]?.url}
                        isHovered={isHovered}
                        hasImageError={hasImageError}
                        onImageError={() => setHasImageError(true)}
                    />
                </Link>

                <div className="absolute top-0 left-0 flex flex-col items-start z-10">
                    {product.isNew && (
                        <span className="bg-black text-white dark:bg-zinc-900 text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-transparent dark:border-white/20">
                            New
                        </span>
                    )}
                    {product.isSale && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">Sale</span>
                    )}
                </div>

                <ProductCardQuickAdd isHovered={isHovered} isInCart={isInCart} isAdding={isAdding} onAction={handleAction} />
            </div>

            <div className="flex-1 flex flex-col">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-1 group-hover:underline">{product.name}</h3>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                    {product.originalPrice && <span className="text-sm text-red-500 line-through">{formatPrice(product.originalPrice)}</span>}
                    <span className="text-lg font-display font-bold">{formatPrice(product.price)}</span>
                </div>

                <ProductCardSizeSelector selectedSize={selectedSize} variants={product.variants} onSelectSize={setSelectedSize} />
            </div>
        </div>
    );
}
