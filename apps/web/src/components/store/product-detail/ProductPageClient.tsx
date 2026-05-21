'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchProductBySlug, fetchProducts } from '@/services/productService';
import { useCart } from '@/store/CartContext';
import { Product } from '@/types';
import ProductPageAccordion from './ProductPage.accordion';
import ProductPageGallery from './ProductPage.gallery';
import ProductPagePurchasePanel from './ProductPage.purchase-panel';
import ProductPageRedirecting from './ProductPage.redirecting';
import ProductPageRelated from './ProductPage.related';
import ProductPageReviews from './ProductPage.reviews';
import ProductPageSkeleton from './ProductPage.skeleton';
import { getDefaultSelectedSize } from './ProductPage.utils';

interface ProductPageClientProps {
    initialProduct?: Product
}

export default function ProductPageClient({ initialProduct }: ProductPageClientProps) {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const { addToCart, setBuyNowItem } = useCart();

    const [product, setProduct] = useState<Product | undefined>(initialProduct);
    const [selectedImage, setSelectedImage] = useState(initialProduct?.images?.[0]?.url || '');
    const [selectedSize, setSelectedSize] = useState(initialProduct ? getDefaultSelectedSize(initialProduct) : '');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(!initialProduct);
    const [isAdding, setIsAdding] = useState(false);
    const [isError, setIsError] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    const selectedVariant = product?.variants?.find((variant) => variant.size === selectedSize);
    const maxStock = selectedVariant?.stock || 0;

    useEffect(() => {
        if (initialProduct) return;

        const loadProduct = async () => {
            if (!slug) return;

            const data = await fetchProductBySlug(slug);
            if (!data || data.category?.isPublished === false) {
                router.replace('/');
                return;
            }

            setProduct(data);
            setSelectedImage(data.images?.[0]?.url || '');
            setSelectedSize(getDefaultSelectedSize(data));
            setLoading(false);
        };

        void loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, router]);

    useEffect(() => {
        const categoryId = product?.category?.id;
        const productId = product?.id;
        if (!categoryId || !productId) return;

        fetchProducts({ categoryId })
            .then((related) => setRelatedProducts(related.filter((p) => p.id !== productId).slice(0, 4)))
            .catch(() => {});
    }, [product?.id, product?.category?.id]);

    useEffect(() => {
        if (!product) return;

        if (quantity > maxStock && maxStock > 0) {
            setQuantity(maxStock);
        } else if (maxStock === 0 && quantity > 0) {
            setQuantity(0);
        } else if (maxStock > 0 && quantity === 0) {
            setQuantity(1);
        }
    }, [product, maxStock, quantity]);

    const handleAddToCart = async () => {
        if (!product || !selectedSize) return;

        const success = await addToCart(product, selectedSize, quantity);
        if (success) {
            setIsAdding(true);
            setTimeout(() => setIsAdding(false), 1000);
            return;
        }

        setIsError(true);
        setTimeout(() => setIsError(false), 1000);
    };

    const handleQuantityChange = (nextQty: number) => {
        if (nextQty >= 1 && nextQty <= maxStock) {
            setQuantity(nextQty);
            return;
        }

        if (nextQty < 1 && maxStock > 0) {
            setQuantity(1);
        }
    };

    const handleBuyNow = () => {
        if (!product || !selectedSize) return;

        setBuyNowItem({
            ...product,
            selectedSize,
            quantity,
        });

        router.push('/checkout?buyNow=true');
    };

    const breadcrumbCategory = useMemo(() => {
        if (!product?.category) return '';
        return product.category.name;
    }, [product]);

    if (loading) {
        return <ProductPageSkeleton />;
    }

    if (!product) {
        return <ProductPageRedirecting />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {product.category?.isPublished !== false && (
                <nav className="flex mb-8 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <span className="hover:text-black dark:hover:text-white cursor-pointer">Inicio</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-black dark:hover:text-white cursor-pointer">{breadcrumbCategory}</span>
                    <span className="mx-2">/</span>
                    <span className="text-black dark:text-white font-medium">{product.name}</span>
                </nav>
            )}

            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                <ProductPageGallery
                    product={product}
                    selectedImage={selectedImage}
                    onSelectImage={setSelectedImage}
                />

                <div className="lg:col-span-5 mt-8 lg:mt-0 flex flex-col">
                    <ProductPagePurchasePanel
                        product={product}
                        selectedSize={selectedSize}
                        quantity={quantity}
                        maxStock={maxStock}
                        selectedVariant={selectedVariant}
                        isAdding={isAdding}
                        isError={isError}
                        onSelectSize={setSelectedSize}
                        onChangeQuantity={handleQuantityChange}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                    />
                    <ProductPageAccordion />
                </div>
            </div>

            <ProductPageRelated products={relatedProducts} />
            <ProductPageReviews />
        </div>
    );
}
