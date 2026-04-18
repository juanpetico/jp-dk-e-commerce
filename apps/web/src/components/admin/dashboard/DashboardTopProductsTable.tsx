import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { TopProduct } from '@/types';
import { formatPrice } from '@/lib/utils';

const IMAGE_FALLBACK_DATA_URL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23e5e7eb' width='1' height='1'/%3E%3C/svg%3E";

interface DashboardTopProductsTableProps {
    topProducts: TopProduct[];
    loading: boolean;
    basePath: '/admin' | '/superadmin';
}

export function DashboardTopProductsTable({ topProducts, loading, basePath }: DashboardTopProductsTableProps) {
    const BATCH_SIZE = 5;
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

    useEffect(() => {
        setVisibleCount(BATCH_SIZE);
    }, [topProducts]);

    const visibleProducts = topProducts.slice(0, visibleCount);
    const canShowMore = visibleCount < topProducts.length;

    return (
        <div className="min-w-0 bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">
                    Top Performers (Productos Estrella)
                </h3>
                {!loading && canShowMore && (
                    <button
                        type="button"
                        onClick={() => setVisibleCount((current) => Math.min(current + BATCH_SIZE, topProducts.length))}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        title="Mostrar 5 más"
                        aria-label="Mostrar 5 más"
                    >
                        Mostrar mas <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm animate-pulse">
                    Cargando productos más vendidos...
                </div>
            ) : topProducts.length > 0 ? (
                <div className="max-h-[28rem] overflow-y-auto pr-1">
                    <div className="space-y-3">
                        {visibleProducts.map((product, index) => (
                        // Keep row non-clickable: only image and icon link to product page.
                        <div
                            key={product.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                <span className="text-xs font-black text-muted-foreground">#{index + 1}</span>
                            </div>

                            {product.imageUrl ? (
                                <Link
                                    href={`/product/${product.slug}`}
                                    className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                                    title={`Ver ${product.name} en tienda`}
                                    aria-label={`Ver ${product.name} en tienda`}
                                >
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        onError={(event) => {
                                            const img = event.currentTarget;
                                            if (img.src !== IMAGE_FALLBACK_DATA_URL) {
                                                img.src = IMAGE_FALLBACK_DATA_URL;
                                            }
                                        }}
                                    />
                                </Link>
                            ) : (
                                <div className="w-12 h-12 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">Sin imagen</span>
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                                <p className="text-[10px] text-muted-foreground">{product.category.name}</p>
                            </div>

                            <div className="text-right">
                                <Link
                                    href={`${basePath}/products?search=${encodeURIComponent(product.slug)}&openProduct=${encodeURIComponent(product.id)}`}
                                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                    title={`Abrir ${product.name} en panel admin`}
                                    aria-label={`Abrir ${product.name} en panel admin`}
                                >
                                    Admin <ExternalLink className="h-3 w-3" />
                                </Link>
                                <p className="text-xs font-bold text-foreground">{product.totalQuantitySold} u.</p>
                                <p className="text-[10px] text-muted-foreground">{formatPrice(product.price)}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    No hay ventas de productos este mes
                </div>
            )}
        </div>
    );
}
