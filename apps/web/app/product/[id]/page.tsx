"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '../../../src/types';
import { fetchProductById } from '../../../src/services/productService';
import { Button } from '@repo/ui';
import { useCart } from '../../../src/store/CartContext';

const ProductPage: React.FC = () => {
    const { id } = useParams() as { id: string };
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        if (id) {
            fetchProductById(id).then((data) => {
                setProduct(data);
                if (data && data.sizes.length > 0) {
                    setSelectedSize(data.sizes[2] || data.sizes[0] || ''); // Default to 'L' if available
                }
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;
    if (!product) return <div className="h-screen flex items-center justify-center">Producto no encontrado</div>;

    const handleAddToCart = () => {
        if (product && selectedSize) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product, selectedSize);
            }
        }
    };

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <nav className="flex mb-8 text-xs text-gray-500 uppercase tracking-wide">
                <span className="hover:text-black">Inicio</span>
                <span className="mx-2">/</span>
                <span className="hover:text-black">{product.category}</span>
                <span className="mx-2">/</span>
                <span className="text-black font-medium">{product.name}</span>
            </nav>

            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                {/* Gallery */}
                <div className="lg:col-span-7">
                    <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-4">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        {product.isNew && (
                            <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
                                Nuevo Drop
                            </span>
                        )}
                    </div>
                    {/* Thumbnails (Mock) */}
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`aspect-square bg-gray-100 rounded border cursor-pointer ${i === 1 ? 'border-black' : 'border-transparent'}`}>
                                <img src={product.images[0]} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-5 mt-8 lg:mt-0">
                    <div className="mb-6">
                        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-2 leading-tight">{product.name}</h1>
                        <div className="flex items-baseline space-x-4">
                            <p className="text-2xl font-medium">{formatPrice(product.price)}</p>
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
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 flex items-center justify-center border rounded font-medium text-sm transition-all ${selectedSize === size
                                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                        : 'bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-wide mb-2">Cantidad</h3>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={decrementQuantity}
                                className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:border-black dark:hover:border-white transition-colors"
                            >
                                <span className="text-lg font-bold">−</span>
                            </button>
                            <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                            <button
                                onClick={incrementQuantity}
                                className="w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded hover:border-black dark:hover:border-white transition-colors"
                            >
                                <span className="text-lg font-bold">+</span>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 mb-4">
                        <Button fullWidth variant="outline" onClick={handleAddToCart} className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            Agregar al carrito
                        </Button>
                        <Button fullWidth onClick={handleAddToCart} className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100">
                            Comprar ahora
                        </Button>
                    </div>

                    {/* Installment Info */}
                    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                            6 cuotas sin interés de {formatPrice(product.price / 6)} con Mercado Pago
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
