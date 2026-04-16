"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '../../../src/types';
import { fetchProductBySlug } from '../../../src/services/productService';
import { Button } from '../../../src/components/ui/Button';
import { useCart } from '../../../src/store/CartContext';
import ImageMagnifier from '../../../src/components/ui/ImageMagnifier';
import { ShoppingCart, Check, ArrowRight, Minus, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ProductPage: React.FC = () => {
    const { slug } = useParams() as { slug: string };
    const router = useRouter(); // Initialize router
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isError, setIsError] = useState(false);
    const { addToCart, cart, updateQuantity, setBuyNowItem, toggleCart } = useCart();

    const selectedVariant = product?.variants?.find(v => v.size === selectedSize);
    const maxStock = selectedVariant?.stock || 0;

    useEffect(() => {
        if (slug) {
            fetchProductBySlug(slug).then((data) => {
                if (!data || data.category?.isPublished === false) {
                    router.replace('/');
                    return;
                }

                setProduct(data);
                if (data) {
                    if (data.images && data.images.length > 0 && data.images[0]) {
                        setSelectedImage(data.images[0].url);
                    }

                    // Filter available sizes (stock > 0)
                    const availableVariants = data.variants?.filter(v => v.stock > 0) || [];
                    if (availableVariants.length > 0) {
                        // Choose a default size if available
                        const preferredOrder = ['L', 'M', 'S', 'XL', 'XXL', 'STD'];
                        const defaultVariant = preferredOrder
                            .map(size => availableVariants.find(v => v.size === size))
                            .find(v => !!v) || availableVariants[0];

                        if (defaultVariant) {
                            setSelectedSize(defaultVariant.size);
                        }
                    }
                }
                setLoading(false);
            });
        }
    }, [slug, router]);

    useEffect(() => {
        if (product && quantity > maxStock && maxStock > 0) {
            setQuantity(maxStock);
        } else if (product && maxStock === 0 && quantity > 0) {
            setQuantity(0);
        } else if (product && maxStock > 0 && quantity === 0) {
            setQuantity(1);
        }
    }, [selectedSize, maxStock, quantity, product]);

    if (loading) return <div className="h-screen flex items-center justify-center">Cargando producto...</div>;
    if (!product) return <div className="h-screen flex items-center justify-center">Redirigiendo...</div>;

    const handleAddToCart = async () => {
        if (product && selectedSize) {
            const success = await addToCart(product, selectedSize, quantity);
            if (success) {
                setIsAdding(true);
                setTimeout(() => setIsAdding(false), 1000);
            } else {
                setIsError(true);
                setTimeout(() => setIsError(false), 1000);
            }
        }
    };

    const handleUpdateQuantity = (newQty: number) => {
        if (newQty >= 1 && newQty <= maxStock) {
            setQuantity(newQty);
        } else if (newQty < 1 && maxStock > 0) {
            setQuantity(1);
        }
    };

    const incrementQuantity = () => {
        if (quantity < maxStock) {
            setQuantity(prev => prev + 1);
        }
    };
    const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {product.category?.isPublished !== false && (
                <nav className="flex mb-8 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <span className="hover:text-black dark:hover:text-white cursor-pointer">Inicio</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-black dark:hover:text-white cursor-pointer">{product.category.name}</span>
                    <span className="mx-2">/</span>
                    <span className="text-black dark:text-white font-medium">{product.name}</span>
                </nav>
            )}

            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                {/* Gallery */}
                <div className="lg:col-span-7">
                    <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-100 dark:border-gray-800">
                        <ImageMagnifier
                            src={selectedImage || (product.images && product.images[0] ? product.images[0].url : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23e5e7eb' width='1' height='1'/%3E%3C/svg%3E")}
                            alt={product.name}
                            className="w-full h-full"
                        />
                        <div className="absolute top-0 left-0 flex flex-col items-start z-10">
                            {product.isNew && (
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
                    {/* Thumbnails */}
                    <div className="grid grid-cols-4 gap-4">
                        {product.images && product.images.map((img, idx) => (
                            <div
                                key={img.id || idx}
                                onClick={() => setSelectedImage(img.url)}
                                className={`aspect-square bg-gray-100 rounded border cursor-pointer overflow-hidden transition-all ${selectedImage === img.url
                                    ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                <img
                                    src={img.url}
                                    alt={`${product.name} view ${idx + 1}`}
                                    className={`w-full h-full object-cover transition-opacity ${selectedImage === img.url ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                                        }`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-5 mt-8 lg:mt-0">
                    <div className="mb-6">
                        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-2 leading-tight">{product.name}</h1>
                        <div className="flex items-baseline space-x-4">
                            {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-lg text-red-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                </p>
                            )}
                            <p className={`text-2xl font-medium ${product.isSale ? 'text-red-600' : ''}`}>
                                {formatPrice(product.price)}
                            </p>
                            <p className="text-sm text-gray-500">Impuestos incluidos.</p>
                        </div>
                    </div>

                    <hr className="border-gray-200 mb-8" />

                    {/* Size Selector */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold uppercase tracking-wide">Talla</h3>
                            <button className="text-xs underline text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">Guía de tallas</button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {product.variants?.map((variant) => {
                                const isOutOfStock = variant.stock <= 0;
                                const isSelected = selectedSize === variant.size;
                                return (
                                    <button
                                        key={variant.size}
                                        onClick={() => !isOutOfStock && setSelectedSize(variant.size)}
                                        disabled={isOutOfStock}
                                        className={cn(
                                            "w-12 h-12 flex items-center justify-center border rounded-md font-bold text-sm transition-all relative overflow-hidden",
                                            isSelected
                                                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white ring-2 ring-black dark:ring-white ring-offset-2 dark:ring-offset-black scale-105"
                                                : isOutOfStock
                                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-600 border-gray-100 dark:border-zinc-800 cursor-not-allowed"
                                                    : "bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-zinc-900"
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

                    {/* Quantity Selector */}
                    <div className={cn("mb-8 transition-opacity duration-200", selectedVariant?.stock === 0 ? "opacity-50 pointer-events-none" : "opacity-100")}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold uppercase tracking-wide">Cantidad</h3>
                            {selectedSize && (
                                <span className={cn(
                                    "text-xs font-bold uppercase",
                                    maxStock <= 0 ? "text-red-600 dark:text-red-400" : maxStock <= 5 ? "text-orange-500" : "text-gray-500"
                                )}>
                                    {maxStock > 0 ? `${maxStock} disponibles` : "Sin stock"}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => handleUpdateQuantity(quantity - 1)}
                                disabled={quantity <= 1 || maxStock === 0}
                                className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:border-black dark:hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-black dark:text-white"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-bold w-12 text-center text-black dark:text-white">{quantity}</span>
                            <button
                                onClick={() => handleUpdateQuantity(quantity + 1)}
                                disabled={quantity >= maxStock || maxStock === 0}
                                className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:border-black dark:hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-black dark:text-white"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 mb-4">
                        <Button
                            variant="outline"
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || selectedVariant.stock <= 0}
                            className={cn(
                                "w-full border-2 flex items-center justify-center gap-2 transition-all duration-300 h-12 font-bold uppercase tracking-wide",
                                !selectedVariant || selectedVariant.stock <= 0
                                    ? "bg-gray-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                    : "bg-white dark:bg-black border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
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
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-400 fill-current" />
                                        <span>Agregado</span>
                                    </motion.div>
                                ) : isError ? (
                                    <motion.div
                                        key="error"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4 text-red-600 dark:text-red-400 fill-current" />
                                        <span>Sin Stock</span>
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
                                        <span>{(!selectedVariant || selectedVariant.stock <= 0) ? "No disponible" : "Agregar al carrito"}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                        <Button
                            onClick={() => {
                                if (product && selectedSize) {
                                    setBuyNowItem({
                                        ...product,
                                        selectedSize,
                                        quantity
                                    });
                                    router.push('/checkout?buyNow=true');
                                }
                            }}
                            disabled={!selectedVariant || selectedVariant.stock <= 0}
                            className={cn(
                                "w-full transition-colors h-12 font-bold uppercase tracking-wide",
                                !selectedVariant || selectedVariant.stock <= 0
                                    ? "bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 cursor-not-allowed hover:bg-gray-200 dark:hover:bg-zinc-800"
                                    : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                            )}
                        >
                            Comprar ahora
                        </Button>
                    </div>

                    {/* Installment Info */}
                    <div className="mb-8 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800/50 flex items-center gap-3">
                        <div className="h-8 w-auto min-w-[3rem] dark:bg-black rounded-full border flex items-center justify-center shrink-0 overflow-hidden px-3">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj7WLHnmXccsnJareD8U_7cMvz5Q7-cFserg&s" alt="Mercado Pago" className="w-full h-full object-contain p-0.5" />
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                            <span className="font-bold">6 cuotas sin interés</span> de {formatPrice(product.price / 6)}
                        </p>
                    </div>

                    {/* Info */}
                    <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <h4 className="font-bold text-black dark:text-white text-base mb-2">Descripción</h4>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Acabado brillante de alta calidad.</li>
                                <li>100% Algodón Premium Heavyweight.</li>
                                <li>Diseñado y confeccionado en Chile.</li>
                            </ul>
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
            </div>
        </div>
    );
};

export default ProductPage;
