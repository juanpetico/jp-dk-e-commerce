import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';

interface ProductPageRelatedProps {
    products: Product[];
}

export default function ProductPageRelated({ products }: ProductPageRelatedProps) {
    if (products.length === 0) return null;

    return (
        <section className="mt-16 border-t border-gray-200 dark:border-zinc-800 pt-12">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-8">
                Quizás también te guste
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
