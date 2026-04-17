'use client';

import LookbookCarouselClient from './lookbook/LookbookCarouselClient';
import { LookbookCarouselProps } from './lookbook/LookbookCarousel.types';

export const LookbookCarousel = ({ products }: LookbookCarouselProps) => {
    return <LookbookCarouselClient products={products} />;
};
