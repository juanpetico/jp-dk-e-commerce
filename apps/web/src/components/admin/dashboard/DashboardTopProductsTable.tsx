import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { TopProduct } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import { DashboardTopProductsRange, DASHBOARD_TOP_PRODUCTS_RANGES } from '@/lib/dashboard/dateRanges';

type SortMode = 'revenue' | 'units';

const IMAGE_FALLBACK_DATA_URL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23e5e7eb' width='1' height='1'/%3E%3C/svg%3E";

interface DashboardTopProductsTableProps {
    topProducts: TopProduct[];
    loading: boolean;
    basePath: '/admin' | '/superadmin';
    selectedRange: DashboardTopProductsRange;
    onRangeSelect: (range: DashboardTopProductsRange) => void;
}

export function DashboardTopProductsTable({ topProducts, loading, basePath, selectedRange, onRangeSelect }: DashboardTopProductsTableProps) {
    const BATCH_SIZE = 5;
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>('revenue');
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevVisibleCount = useRef(BATCH_SIZE);

    const sortedProducts = useMemo(() => {
        if (sortMode === 'units') {
            return [...topProducts].sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
        }
        return [...topProducts].sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [topProducts, sortMode]);

    useEffect(() => {
        setVisibleCount(BATCH_SIZE);
        setIsAtBottom(false);
    }, [topProducts]);

    // Cuando se cargan más items, hacer scroll suave al fondo para revelarlos
    useEffect(() => {
        if (visibleCount > prevVisibleCount.current && scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
        prevVisibleCount.current = visibleCount;
    }, [visibleCount]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 8);
    };

    const visibleProducts = sortedProducts.slice(0, visibleCount);
    const canShowMore = visibleCount < sortedProducts.length;
    const showFade = visibleCount > BATCH_SIZE && !isAtBottom;

    const emptyLabel = selectedRange === 'ALL'
        ? 'No hay ventas registradas'
        : `No hay ventas en los últimos ${selectedRange}`;

    return (
        <div className="min-w-0 bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">
                        Top 10 Productos Estrellas
                    </h3>
                    <div className="flex items-center rounded-md border border-gray-300 dark:border-border overflow-hidden text-[10px] font-bold">
                        <button
                            type="button"
                            onClick={() => setSortMode('revenue')}
                            className={cn(
                                'px-2 py-0.5 transition-colors',
                                sortMode === 'revenue'
                                    ? 'bg-foreground text-background'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Ingresos
                        </button>
                        <button
                            type="button"
                            onClick={() => setSortMode('units')}
                            className={cn(
                                'px-2 py-0.5 border-l border-gray-300 dark:border-border transition-colors',
                                sortMode === 'units'
                                    ? 'bg-foreground text-background'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            Unidades
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        {DASHBOARD_TOP_PRODUCTS_RANGES.map((range) => (
                            <button
                                key={range}
                                type="button"
                                onClick={() => onRangeSelect(range)}
                                className={cn(
                                    'text-[10px] px-1.5 py-0.5 rounded transition-colors font-semibold',
                                    selectedRange === range
                                        ? 'bg-foreground text-background'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
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
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm animate-pulse">
                    Cargando productos más vendidos...
                </div>
            ) : topProducts.length > 0 ? (
                <div className="relative">
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="max-h-[28rem] overflow-y-auto pr-1"
                    >
                        <div className="space-y-3">
                            {visibleProducts.map((product, index) => (
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
                                        {sortMode === 'revenue' ? (
                                            <>
                                                <p className="text-xs font-bold text-foreground">{formatPrice(product.totalRevenue)}</p>
                                                <p className="text-[10px] text-muted-foreground">{product.totalQuantitySold} u. · {formatPrice(product.price)}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs font-bold text-foreground">{product.totalQuantitySold} u.</p>
                                                <p className="text-[10px] text-muted-foreground">{formatPrice(product.totalRevenue)} · {formatPrice(product.price)}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fade que indica contenido scrolleable por debajo */}
                    <div
                        className={cn(
                            'pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent transition-opacity duration-300',
                            showFade ? 'opacity-100' : 'opacity-0'
                        )}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    {emptyLabel}
                </div>
            )}
        </div>
    );
}
