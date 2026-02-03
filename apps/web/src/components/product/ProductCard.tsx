"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '../../types';
import { Button } from '@repo/ui';
import { useCart } from '../../store/CartContext';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const [isHovered, setIsHovered] = React.useState(false);

    // Helper to format currency CLP
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    return (
        <div
            className="group flex flex-col h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                <Link href={`/product/${product.id}`}>
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {product.isNew && (
                        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                            New
                        </span>
                    )}
                    {product.isSale && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                            Sale
                        </span>
                    )}
                </div>

                {/* Quick Add Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
                    <Button
                        fullWidth
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product, product.sizes[0] || ''); // Default to first size for quick add
                        }}
                        className="bg-white text-black border-white hover:bg-gray-100 shadow-lg"
                    >
                        Añadir al Carrito
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <Link href={`/product/${product.id}`}>
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-1 group-hover:underline">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                    {product.originalPrice && (
                        <span className="text-sm text-red-500 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                    <span className="text-lg font-display font-bold">
                        {formatPrice(product.price)}
                    </span>
                </div>

                {/* Size Preview */}
                <div className="flex flex-wrap gap-1 mt-auto">
                    {product.sizes.map((size) => (
                        <div
                            key={size}
                            className="w-6 h-6 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer"
                        >
                            {size}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
