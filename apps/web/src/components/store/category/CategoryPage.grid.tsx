import ProductCard from '@/components/product/ProductCard';
import { CategoryPageGridProps } from './CategoryPage.types';

export default function CategoryPageGrid({ products }: CategoryPageGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
