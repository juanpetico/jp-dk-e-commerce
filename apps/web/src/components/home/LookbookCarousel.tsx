"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';
import { useCart } from '@/store/CartContext';

interface LookbookCarouselProps {
    products: Product[];
}

export const LookbookCarousel: React.FC<LookbookCarouselProps> = ({ products }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const realLength = products.length;

    // Extended products for infinite scroll (buffer before and after)
    const extendedProducts = useMemo(() => [...products, ...products, ...products], [products]);

    const [containerStyle, setContainerStyle] = useState({});

    useEffect(() => {
        if (realLength > 0 && scrollContainerRef.current) {
            if (scrollContainerRef.current.scrollLeft === 0 && activeIndex === 0) {
                const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
                if (itemWidth > 0) {
                    const gap = 16;
                    scrollContainerRef.current.scrollLeft = realLength * (itemWidth + gap);
                    setActiveIndex(realLength);
                }
            }
        }
    }, [realLength, activeIndex]);

    useEffect(() => {
        const updateDimensions = () => {
            if (typeof window === 'undefined') return;
            const itemWidth = window.innerWidth >= 768 ? 400 : window.innerWidth * 0.85;
            const gap = 16;
            const maxPossibleWidth = Math.min(1280, window.innerWidth - 32);
            const nItems = Math.floor((maxPossibleWidth + gap) / (itemWidth + gap));
            const visibleItems = Math.max(1, nItems);
            const newWidth = visibleItems * itemWidth + (visibleItems - 1) * gap;
            setContainerStyle({
                maxWidth: `${newWidth}px`,
                margin: '0 auto'
            });
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const scrollToIndex = (index: number) => {
        if (scrollContainerRef.current) {
            const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
            if (itemWidth > 0) {
                const gap = 16;
                scrollContainerRef.current.scrollTo({
                    left: index * (itemWidth + gap),
                    behavior: 'smooth'
                });
                setActiveIndex(index);
            }
        }
    };

    const slideNext = () => scrollToIndex(activeIndex + 1);
    const slidePrev = () => scrollToIndex(activeIndex - 1);

    useEffect(() => {
        if (realLength === 0) return;
        const interval = setInterval(() => slideNext(), 3000);
        return () => clearInterval(interval);
    }, [activeIndex, realLength]);

    const handleScroll = () => {
        if (scrollContainerRef.current && realLength > 0) {
            const { scrollLeft } = scrollContainerRef.current;
            const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
            if (itemWidth > 0) {
                const gap = 16;
                const singleSetWidth = realLength * (itemWidth + gap);
                const index = Math.round(scrollLeft / (itemWidth + gap));
                if (index !== activeIndex) setActiveIndex(index);

                if (scrollLeft >= 2 * singleSetWidth) {
                    scrollContainerRef.current.scrollLeft = scrollLeft - singleSetWidth;
                    setActiveIndex(index - realLength);
                }
            }
        }
    };

    useEffect(() => {
        if (activeIndex < realLength && realLength > 0 && scrollContainerRef.current) {
            const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
            const gap = 16;
            const newIndex = activeIndex + realLength;
            scrollContainerRef.current.scrollTo({ left: newIndex * (itemWidth + gap), behavior: 'auto' });
            setActiveIndex(newIndex);
        }
        if (activeIndex >= 2 * realLength && realLength > 0 && scrollContainerRef.current) {
            const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
            const gap = 16;
            const newIndex = activeIndex - realLength;
            scrollContainerRef.current.scrollTo({ left: newIndex * (itemWidth + gap), behavior: 'auto' });
            setActiveIndex(newIndex);
        }
    }, [activeIndex, realLength]);

    return (
        <section className="bg-black text-white py-16 relative">
            <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
                <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight mb-8">
                    Lookbook Shooters
                </h2>
            </div>

            <div className="relative max-w-full px-4 md:px-12 flex justify-center items-center">
                <button onClick={slidePrev} className="absolute left-0 md:left-4 z-10 p-2 text-white hover:text-yellow-400 transition-colors">
                    <ChevronLeft size={48} />
                </button>

                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    style={containerStyle}
                    className="flex overflow-x-auto gap-4 py-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                >
                    {extendedProducts.map((product, index) => (
                        <LookbookCard key={`${product.id}-${index}`} product={product} />
                    ))}
                </div>

                <button onClick={slideNext} className="absolute right-0 md:right-4 z-10 p-2 text-white hover:text-yellow-400 transition-colors">
                    <ChevronRight size={48} />
                </button>
            </div>

            <div className="flex justify-center gap-2 mt-4 cursor-pointer">
                {products.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => scrollToIndex(index + realLength)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === (activeIndex % realLength) ? 'bg-white scale-125' : 'bg-gray-600 hover:bg-gray-500'}`}
                    />
                ))}
            </div>
        </section>
    );
};

const LookbookCard = ({ product }: { product: Product }) => {
    const { addToCart, toggleCart, cart } = useCart();
    const [selectedSize, setSelectedSize] = useState<string>(() => {
        const available = product.variants?.find(v => v.stock > 0);
        return available ? available.size : (product.variants?.[0]?.size || '');
    });

    const isInCart = cart.some(item => item.id === product.id);
    const formatPrice = (price: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);

    const handleAddToCart = () => {
        if (isInCart) {
            toggleCart();
            return;
        }
        if (selectedSize) addToCart(product, selectedSize);
    };

    return (
        <div className="flex-none w-[85vw] md:w-[400px] snap-center flex flex-col group">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 mb-4">
                <Link href={`/product/${product.slug}`}>
                    <img
                        src={product.images && product.images[0] ? product.images[0].url : '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    />
                </Link>
                <div className="absolute top-0 left-0 flex flex-col items-start z-10">
                    {product.isNew && <span className="bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest pointer-events-none">New</span>}
                    {product.isSale && <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest pointer-events-none">Sale</span>}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-display font-bold uppercase text-sm tracking-widest group-hover:underline transition-all">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-2">
                    {product.originalPrice && <span className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>}
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
                                className={`w-8 h-8 flex items-center justify-center text-[10px] transition-all duration-200 border rounded-sm ${selectedSize === variant.size
                                    ? 'bg-white text-black border-white font-bold'
                                    : isOutOfStock ? 'border-neutral-800 text-neutral-600 cursor-not-allowed opacity-50' : 'border-white/20 text-gray-400 hover:border-white hover:text-white'
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
                        className={`rounded-full shadow-md text-xs px-8 py-2.5 h-auto font-bold uppercase tracking-widest transition-all ${isInCart ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500 scale-105' : 'bg-white text-black border-none hover:bg-gray-200 active:scale-95'}`}
                        onClick={handleAddToCart}
                    >
                        {isInCart ? 'Ver Carrito' : 'Añadir al Carrito'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
