# Design: HomePage RSC Optimization

## Purpose
Convert the monolithic client-side `app/page.tsx` into a hybrid Server/Client architecture to improve SEO and LCP while maintaining the complex Lookbook carousel UX.

## Architecture

### Server Layer
- **`app/page.tsx`**: Fetches initial products (8 for Featured, 8 for Lookbook) via `fetchProducts()`.
- **`components/home/Hero.tsx`**: Static visual banner.

### Client Layer
- **`components/home/LookbookCarousel.tsx`**:
    - **Product Duplication**: Triplicates the 8 products into `extendedProducts` using `useMemo`.
    - **Infinite Scroll**: Preserves "Silent Reset" logic in `handleScroll`.
    - **Auto-scroll**: Preserves 3s interval effect.
- **`components/product/ProductCard.tsx`**: Stays as client component for hover/modal logic.

## Data Flow
1. Next.js fetches data on the server during request.
2. Server renders `Hero` and `FeaturedSection` (static grid).
3. `LookbookCarousel` hydrates on the client, triplicates data, and initializes scroll position to the middle set.

## Verification
- SEO check: Initial HTML should contain product names.
- Interaction check: Carousel should loop infinitely and auto-scroll.
