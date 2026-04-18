import ProductCard from '@/components/product/ProductCard';
import { CatalogGridProps } from './CatalogPage.types';

export default function CatalogPageGrid({ products }: CatalogGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12 animate-fade-in">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
