"use client";

import ProductCardClient from './product-card/ProductCardClient';
import { ProductCardProps } from './product-card/ProductCard.types';

export default function ProductCard({ product }: ProductCardProps) {
    return <ProductCardClient product={product} />;
}
