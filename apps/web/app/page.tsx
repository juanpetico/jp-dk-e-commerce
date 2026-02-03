"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '../src/components/product/ProductCard';
import { Button } from '@repo/ui';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Product } from '../src/types';
import { fetchProducts } from '../src/services/productService';
import { useCart } from '../src/store/CartContext';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Extended products for infinite scroll (buffer before and after)
  const extendedProducts = [...featuredProducts, ...featuredProducts, ...featuredProducts];
  const realLength = featuredProducts.length;

  useEffect(() => {
    fetchProducts().then((products) => {
      // Get products for the featured section
      setFeaturedProducts(products.slice(0, 8));
      // Initialize activeIndex to the start of the middle set
      setActiveIndex(products.slice(0, 8).length);
    });
  }, []);

  const [containerStyle, setContainerStyle] = useState({});

  // Ensure we start in the middle set when data loads or dimensions change
  useEffect(() => {
    if (featuredProducts.length > 0 && scrollContainerRef.current) {
      // Only if we are at 0 (initial load state before logic took over)
      if (scrollContainerRef.current.scrollLeft === 0 && activeIndex === 0) {
        const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
        if (itemWidth > 0) {
          const gap = 16;
          scrollContainerRef.current.scrollLeft = realLength * (itemWidth + gap);
          setActiveIndex(realLength);
        }
      }
    }
  }, [featuredProducts, realLength, activeIndex]);


  // Calculate width to fit exact number of items
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window === 'undefined') return;

      const itemWidth = window.innerWidth >= 768 ? 400 : window.innerWidth * 0.85; // Match CSS w-[85vw] md:w-[400px]
      const gap = 16; // gap-4 = 16px

      // Calculate how many full items fit
      const maxPossibleWidth = Math.min(1280, window.innerWidth - 32); // Max-w-7xl approx
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

  const slideNext = () => {
    if (!scrollContainerRef.current) return;
    const next = activeIndex + 1;
    scrollToIndex(next);
  };

  const slidePrev = () => {
    if (!scrollContainerRef.current) return;
    const prev = activeIndex - 1;
    scrollToIndex(prev);
  };


  // Auto-scroll effect
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const interval = setInterval(() => {
      slideNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex, featuredProducts.length]);

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

  const handleScroll = () => {
    if (scrollContainerRef.current && realLength > 0) {
      const { scrollLeft } = scrollContainerRef.current;
      const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;

      if (itemWidth > 0) {
        const gap = 16;
        const singleSetWidth = realLength * (itemWidth + gap);

        // Calculate current index
        const index = Math.round(scrollLeft / (itemWidth + gap));

        // Update active index state for tracking
        if (index !== activeIndex) {
          setActiveIndex(index);
        }

        // Infinite Loop Logic (Silent Reset)
        // If we scrolled past the second set (into the third), reset to start of second
        if (scrollLeft >= 2 * singleSetWidth) {
          scrollContainerRef.current.scrollLeft = scrollLeft - singleSetWidth;
          setActiveIndex(index - realLength);
        }
        // If we scrolled before the second set (into the first), reset to end of second
        else if (scrollLeft <= 5) { // nearly 0
          // This is tricky for smooth scroll backwards.
          // Better logic: If index < realLength, jump to index + realLength
          // But we need to do this WITHOUT smooth behavior to be invisible.
        }
      }
    }
  };

  // Special check for backward loop during scroll results
  useEffect(() => {
    if (activeIndex < realLength && realLength > 0 && scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
      const gap = 16;
      // Jump forward by one set length
      // We use 'auto' behavior to make it instant
      const newIndex = activeIndex + realLength;
      scrollContainerRef.current.scrollTo({
        left: newIndex * (itemWidth + gap),
        behavior: 'auto'
      });
      setActiveIndex(newIndex);
    }
    // Also check forward bound for completeness (although handleScroll catches it)
    if (activeIndex >= 2 * realLength && realLength > 0 && scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
      const gap = 16;
      const newIndex = activeIndex - realLength;
      scrollContainerRef.current.scrollTo({
        left: newIndex * (itemWidth + gap),
        behavior: 'auto'
      });
      setActiveIndex(newIndex);
    }
  }, [activeIndex, realLength]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[600px] bg-black overflow-hidden group">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_FNH6tNtx5xuVkybd_qvjNMCEsoplU1Tm3yOVmRYnYH2uhOAP5snypXPdAksK0RhkudSRR2MRXY0Ie3ndiu25lQwytLfiFSvN4JNm8fGpUqs2cDo8H23zHV_SEtRSNOCq98Iy5VKsRocVpfg6w3g1sKOfL7vMy0uKhOLEBDmEvtWaNyFJVH2m_Z9PQriAtyOlshmbK6W7sVKVynWfbj-hX6Mll8OyS4dGTQ1tnqdbpqf5N57_LiROge-PK19qLzxUFWQYn6ckzk4"
          alt="Streetwear model"
          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-yellow-400 font-display font-bold tracking-wider uppercase text-lg md:text-xl mb-2 animate-pulse">
            Tu Verano con las mejores prendas
          </h2>
          <h1 className="text-white font-display font-black text-6xl md:text-8xl tracking-tighter uppercase mb-6 drop-shadow-lg" style={{ textShadow: '4px 4px 0px rgba(255,0,255,0.5)' }}>
            JP DK GANG
          </h1>

          <div className="bg-black/80 backdrop-blur-md border border-white/20 p-6 max-w-2xl transform -skew-x-2">
            <p className="text-white font-display text-2xl md:text-3xl uppercase font-bold leading-tight transform skew-x-2">
              COMPRA 1 + 1 <span className="text-yellow-400">QUEDA CON 25% OFF</span><br />
              COMPRA 2 + 1 <span className="text-yellow-400">QUEDA CON 45% OFF</span>
            </p>
            <div className="transform skew-x-2 mt-6">
              <Link href="/catalog">
                <Button className="bg-white text-black hover:bg-gray-200 border-none font-black text-lg px-8 py-3">
                  Ver Colección
                </Button>
              </Link>
            </div>
          </div>
          <p className="mt-8 text-yellow-400 font-bold uppercase tracking-widest text-sm">Compras sobre $50.000 llevan regalo + envío gratis</p>
        </div>
      </div>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-black inline-block relative z-10 bg-white px-6">
            Nuevo Drop Shooters BG
          </h2>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-0"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/catalog">
            <Button variant="outline" className="rounded-full px-10">Ver Todo</Button>
          </Link>
        </div>
      </section>

      {/* Lookbook Preview */}
      <section className="bg-black text-white py-16 relative">
        <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight mb-8">
            Lookbook Shooters
          </h2>
        </div>

        <div className="relative max-w-full px-4 md:px-12 flex justify-center items-center">
          {/* Left Arrow */}
          <button
            onClick={slidePrev}
            className="absolute left-0 md:left-4 z-10 p-2 text-white hover:text-yellow-400 transition-colors"
          >
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

          {/* Right Arrow */}
          <button
            onClick={slideNext}
            className="absolute right-0 md:right-4 z-10 p-2 text-white hover:text-yellow-400 transition-colors"
          >
            <ChevronRight size={48} />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-4 cursor-pointer">
          {featuredProducts.map((_, index) => (
            <div
              key={index}
              onClick={() => scrollToIndex(index + realLength)} // Map click to middle set
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === (activeIndex % realLength) ? 'bg-white scale-125' : 'bg-gray-600 hover:bg-gray-500'}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

// Internal Component for Lookbook Card
const LookbookCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };

  return (
    <div className="flex-none w-[85vw] md:w-[400px] snap-center flex flex-col group">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-900 mb-4">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-display font-bold uppercase text-sm tracking-widest">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
          )}
          <span className="font-bold text-sm">{formatPrice(product.price)}</span>
        </div>

        {/* Sizes */}
        <div className="flex gap-1 my-1">
          {product.sizes.map(size => (
            <div key={size} className="border border-white/20 w-6 h-6 flex items-center justify-center text-[10px] text-gray-300 hover:border-white hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer">
              {size}
            </div>
          ))}
        </div>

        {/* Add Button */}
        <div className="mt-2">
          <Button
            variant="outline"
            className="rounded-full bg-white text-black hover:bg-gray-200 border-none text-xs px-6 py-2 h-auto"
            onClick={() => addToCart(product, product.sizes[0] || '')}
          >
            Añadir al carrito
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
