import Link from 'next/link';
import { SearchOverlayResultsProps } from './SearchOverlay.types';
import { formatProductPrice, getProductFallbackImage } from './SearchOverlay.utils';

export default function SearchOverlayResults({ searchTerm, isLoading, suggestions, products, onClose }: SearchOverlayResultsProps) {
    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 border-t border-border">
            <div className="max-w-4xl mx-auto w-full">
                {searchTerm.length > 0 && (suggestions.length > 0 || products.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Sugerencias</h3>
                            <ul className="space-y-3">
                                {suggestions.map((category) => (
                                    <li key={category.id}>
                                        <Link
                                            href={`/catalog?category=${category.slug || category.id}`}
                                            onClick={onClose}
                                            className="text-foreground font-bold text-sm hover:underline hover:text-muted-foreground block"
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="md:col-span-8">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Productos</h3>
                            <div className="space-y-4">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.slug || product.id}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 group hover:bg-accent p-2 rounded transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-muted flex-shrink-0 rounded-md overflow-hidden">
                                            <img
                                                src={product.images?.[0]?.url || getProductFallbackImage()}
                                                alt={product.name}
                                                className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                                            />
                                        </div>
                                        <div>
                                            <span className="font-bold text-sm text-foreground group-hover:underline block">{product.name}</span>
                                            <span className="text-xs text-muted-foreground">{formatProductPrice(product.price)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : searchTerm.length > 0 && products.length === 0 && !isLoading ? (
                    <div className="text-center text-muted-foreground mt-4 pb-8">
                        <p>No se encontraron resultados para "{searchTerm}"</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
