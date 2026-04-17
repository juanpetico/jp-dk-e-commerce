'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LookbookCard from './LookbookCard';
import LookbookCarouselDots from './LookbookCarousel.dots';
import { LookbookCarouselProps } from './LookbookCarousel.types';
import { getCarouselContainerStyle, getCarouselGap } from './LookbookCarousel.utils';

export default function LookbookCarouselClient({ products }: LookbookCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const realLength = products.length;

    const [activeIndex, setActiveIndex] = useState(0);
    const [containerStyle, setContainerStyle] = useState({});

    const extendedProducts = useMemo(() => {
        return [...products, ...products, ...products];
    }, [products]);

    useEffect(() => {
        if (realLength > 0 && scrollContainerRef.current && scrollContainerRef.current.scrollLeft === 0 && activeIndex === 0) {
            const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
            if (itemWidth > 0) {
                scrollContainerRef.current.scrollLeft = realLength * (itemWidth + getCarouselGap());
                setActiveIndex(realLength);
            }
        }
    }, [realLength, activeIndex]);

    useEffect(() => {
        const updateDimensions = () => {
            if (typeof window === 'undefined') return;
            setContainerStyle(getCarouselContainerStyle(window.innerWidth));
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const scrollToIndex = (index: number) => {
        if (!scrollContainerRef.current) return;

        const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
        if (itemWidth <= 0) return;

        scrollContainerRef.current.scrollTo({
            left: index * (itemWidth + getCarouselGap()),
            behavior: 'smooth',
        });

        setActiveIndex(index);
    };

    const slideNext = () => scrollToIndex(activeIndex + 1);
    const slidePrev = () => scrollToIndex(activeIndex - 1);

    useEffect(() => {
        if (realLength === 0) return;

        const interval = setInterval(() => slideNext(), 3000);
        return () => clearInterval(interval);
    }, [activeIndex, realLength]);

    const handleScroll = () => {
        if (!scrollContainerRef.current || realLength === 0) return;

        const { scrollLeft } = scrollContainerRef.current;
        const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;

        if (itemWidth <= 0) return;

        const singleSetWidth = realLength * (itemWidth + getCarouselGap());
        const index = Math.round(scrollLeft / (itemWidth + getCarouselGap()));

        if (index !== activeIndex) {
            setActiveIndex(index);
        }

        if (scrollLeft >= 2 * singleSetWidth) {
            scrollContainerRef.current.scrollLeft = scrollLeft - singleSetWidth;
            setActiveIndex(index - realLength);
        }
    };

    useEffect(() => {
        if (!scrollContainerRef.current || realLength === 0) return;

        const itemWidth = scrollContainerRef.current.children[0]?.clientWidth || 0;
        if (itemWidth <= 0) return;

        if (activeIndex < realLength) {
            const newIndex = activeIndex + realLength;
            scrollContainerRef.current.scrollTo({
                left: newIndex * (itemWidth + getCarouselGap()),
                behavior: 'auto',
            });
            setActiveIndex(newIndex);
            return;
        }

        if (activeIndex >= 2 * realLength) {
            const newIndex = activeIndex - realLength;
            scrollContainerRef.current.scrollTo({
                left: newIndex * (itemWidth + getCarouselGap()),
                behavior: 'auto',
            });
            setActiveIndex(newIndex);
        }
    }, [activeIndex, realLength]);

    const activeDotIndex = realLength > 0 ? activeIndex % realLength : 0;

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

            <LookbookCarouselDots
                total={products.length}
                activeIndex={activeDotIndex}
                onSelect={(index) => scrollToIndex(index + realLength)}
            />
        </section>
    );
}
