import { CSSProperties } from 'react';

const CAROUSEL_GAP = 16;

export const getCarouselGap = () => CAROUSEL_GAP;

export const getLookbookItemWidth = (viewportWidth: number) => {
    return viewportWidth >= 768 ? 400 : viewportWidth * 0.85;
};

export const getCarouselContainerStyle = (viewportWidth: number): CSSProperties => {
    const itemWidth = getLookbookItemWidth(viewportWidth);
    const maxPossibleWidth = Math.min(1280, viewportWidth - 32);
    const itemsPerView = Math.max(1, Math.floor((maxPossibleWidth + CAROUSEL_GAP) / (itemWidth + CAROUSEL_GAP)));
    const computedWidth = itemsPerView * itemWidth + (itemsPerView - 1) * CAROUSEL_GAP;

    return {
        maxWidth: `${computedWidth}px`,
        margin: '0 auto',
    };
};

export const getFallbackImageDataUrl = () => {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23e5e7eb' width='1' height='1'/%3E%3C/svg%3E";
};
