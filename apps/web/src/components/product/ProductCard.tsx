"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { useCart } from '../../store/CartContext';
import { cn } from '@/lib/utils';
import { ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart, cart, toggleCart } = useCart();
    const [isHovered, setIsHovered] = React.useState(false);
    const [isAdding, setIsAdding] = React.useState(false);
    const [selectedSize, setSelectedSize] = React.useState<string>(() => {
        const availableVariants = product.variants?.filter(v => v.stock > 0) || [];
        if (availableVariants.length > 0) {
            const preferredOrder = ['L', 'M', 'S', 'XL', 'XXL', 'STD'];
            const defaultVariant = preferredOrder
                .map(size => availableVariants.find(v => v.size === size))
                .find(v => !!v) || availableVariants[0];
            return defaultVariant ? defaultVariant.size : '';
        }
        return product.variants?.[0]?.size || '';
    });

    // Check if any variant of this product is in cart
    const isInCart = cart.some(item => item.id === product.id);

    // Helper to format currency CLP
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    const handleAction = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isInCart) {
            toggleCart();
            return;
        }

        // If it's the main button, add selected size
        if (selectedSize) {
            confirmAddition(selectedSize);
        }
    };

    const confirmAddition = (size: string) => {
        setIsAdding(true);
        addToCart(product, size);
        setTimeout(() => {
            setIsAdding(false);
        }, 1500);
    };

    return (
        <div
            className="group flex flex-col h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
        >
            <div className="relative aspect-[4/5] bg-gray-100 mb-4 overflow-hidden">
                <Link href={`/product/${product.slug}`}>
                    <img
                        src={product.images && product.images[0] ? product.images[0].url : '/placeholder.jpg'}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isHovered ? 'scale-110' : 'scale-100'}`}
                    />
                </Link>

                {/* Badges */}
                <div className="absolute top-0 left-0 flex flex-col items-start z-10">
                    {product.isNew && (
                        <span className="bg-black text-white dark:bg-zinc-900 text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-transparent dark:border-white/20">
                            New
                        </span>
                    )}
                    {product.isSale && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                            Sale
                        </span>
                    )}
                </div>

                {/* Quick Add Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
                    <Button
                        onClick={handleAction}
                        className={cn(
                            "w-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 h-10 px-4",
                            isInCart
                                ? "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                : "bg-white text-black border-white hover:bg-gray-100 dark:bg-zinc-900 dark:text-white dark:border-zinc-800"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {isAdding ? (
                                <motion.div
                                    key="check"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Agregado</span>
                                </motion.div>
                            ) : isInCart ? (
                                <motion.div
                                    key="inCart"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Ver Carrito</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="cart"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Añadir</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <Link href={`/product/${product.slug}`}>
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

                <div className="flex flex-wrap gap-1 mt-auto">
                    {product.variants?.map((variant) => {
                        const isOutOfStock = variant.stock <= 0;
                        return (
                            <button
                                key={variant.size}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isOutOfStock) setSelectedSize(variant.size);
                                }}
                                disabled={isOutOfStock}
                                className={cn(
                                    "w-10 h-8 flex items-center justify-center border text-[10px] font-bold transition-all duration-200 cursor-pointer rounded-sm hover:scale-105",
                                    selectedSize === variant.size
                                        ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                                        : isOutOfStock
                                            ? "bg-gray-50 dark:bg-zinc-900/50 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed opacity-50"
                                            : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                                )}
                            >
                                {variant.size}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
