import React from 'react';
import Link from 'next/link';
import ProductCard from '../src/components/product/ProductCard';
import { Button } from '@repo/ui';
import { fetchProducts } from '../src/services/productService';
import { Hero } from '../src/components/home/Hero';
import { LookbookCarousel } from '../src/components/home/LookbookCarousel';

const HomePage = async () => {
  const products = await fetchProducts();
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-black dark:text-white inline-block relative z-10 bg-white dark:bg-black px-6">
            Nuevo Drop Shooters BG
          </h2>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 dark:bg-gray-700 -z-0"></div>
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

      {/* Lookbook Section (Client Component) */}
      <LookbookCarousel products={featuredProducts} />
    </div>
  );
};

export default HomePage;
