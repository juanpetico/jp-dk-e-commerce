"use client";

import React, { useMemo, useState } from 'react';
import { Product } from '@/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/Button';
import ProductListThumbnail from '@/components/admin/products/ProductListThumbnail';
import { StockBadgeList } from '@/components/admin/products/StockBadgeList';
import { ProductStatusToggle, ProductRowButtons } from '@/components/admin/products/ProductRowActions';
import TablePagination from '@/components/admin/shared/TablePagination';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import { useAdminProducts } from '@/components/admin/products/ProductsClientManager';
import { exportRowsToExcel } from '@/services/exportExcelService';
import { exportRowsToPdf } from '@/services/exportPdfService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AdminSearchInput from '@/components/admin/shared/AdminSearchInput';

interface ProductsTableProps {
    products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') ?? '');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('category') ?? 'ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const categoryOptions = useMemo(() => {
        const seen = new Set<string>();
        const options: { slug: string; name: string }[] = [];
        for (const p of products) {
            if (!seen.has(p.category.slug)) {
                seen.add(p.category.slug);
                options.push({ slug: p.category.slug, name: p.category.name });
            }
        }
        return options.sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    const filteredProducts = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return products.filter((product) => {
            const matchesSearch =
                searchValue.length === 0 ||
                product.name.toLowerCase().includes(searchValue) ||
                product.slug.toLowerCase().includes(searchValue) ||
                product.category.name.toLowerCase().includes(searchValue);

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'PUBLISHED' && product.isPublished) ||
                (statusFilter === 'DRAFT' && !product.isPublished);

            const matchesCategory =
                categoryFilter === 'ALL' ||
                product.category.slug === categoryFilter;

            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [products, search, statusFilter, categoryFilter]);

    const totalItems = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const hasFilters = search.trim() !== '' || statusFilter !== 'ALL' || categoryFilter !== 'ALL';

    const { openEditModal, setFilteredCount, setCurrentExportCount, setExportHandlers } = useAdminProducts();
    React.useEffect(() => {
        setFilteredCount(totalItems);
        setCurrentExportCount(hasFilters ? filteredProducts.length : paginatedProducts.length);
    }, [
        totalItems,
        hasFilters,
        filteredProducts.length,
        paginatedProducts.length,
        setFilteredCount,
        setCurrentExportCount,
    ]);

    React.useEffect(() => {
        const getRows = (source: Product[]) => {
            if (source.length === 0) {
                toast.error('No hay productos para exportar');
                return null;
            }

            return source.map((product) => ({
                ID: product.id,
                Nombre: product.name,
                SKU: product.slug,
                Categoria: product.category?.name || '-',
                Estado: product.isPublished ? 'Publicado' : 'Borrador',
                Oferta: product.isSale ? 'Si' : 'No',
                Precio: product.price,
                'Precio Original': product.originalPrice ?? '-',
                Stock: (product.variants || []).reduce((acc, variant) => acc + (variant.stock || 0), 0),
            }));
        };

        setExportHandlers({
            pdfCurrent: () => {
                const rows = getRows(hasFilters ? filteredProducts : paginatedProducts);
                if (!rows) return;
                exportRowsToPdf(rows, {
                    fileNameBase: 'productos',
                    title: 'REPORTE DE PRODUCTOS',
                });
                toast.success(`Reporte PDF generado (${rows.length} registros, ${hasFilters ? 'filtros actuales' : 'pagina actual'})`);
            },
            excelCurrent: () => {
                const rows = getRows(hasFilters ? filteredProducts : paginatedProducts);
                if (!rows) return;
                exportRowsToExcel(rows, {
                    fileNameBase: 'productos',
                    sheetName: 'Productos',
                });
                toast.success(`Archivo Excel generado (${rows.length} registros, ${hasFilters ? 'filtros actuales' : 'pagina actual'})`);
            },
            pdfAll: () => {
                const rows = getRows(filteredProducts);
                if (!rows) return;
                exportRowsToPdf(rows, {
                    fileNameBase: 'productos',
                    title: 'REPORTE DE PRODUCTOS',
                });
                toast.success(`Reporte PDF generado (${rows.length} registros, todos)`);
            },
            excelAll: () => {
                const rows = getRows(filteredProducts);
                if (!rows) return;
                exportRowsToExcel(rows, {
                    fileNameBase: 'productos',
                    sheetName: 'Productos',
                });
                toast.success(`Archivo Excel generado (${rows.length} registros, todos)`);
            },
        });

        return () => {
            setExportHandlers(null);
        };
    }, [filteredProducts, paginatedProducts, hasFilters, setExportHandlers]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(price);
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, categoryFilter, itemsPerPage]);

    React.useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    React.useEffect(() => {
        const openProductId = searchParams.get('openProduct');
        if (!openProductId) return;

        const target = products.find((product) => product.id === openProductId);
        if (!target) return;

        openEditModal(target);

        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.delete('openProduct');
        const nextQuery = nextParams.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }, [openEditModal, pathname, products, router, searchParams]);

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('ALL');
        setCategoryFilter('ALL');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <AdminSearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar por nombre, slug o categoria..."
                />

                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas las categorías</SelectItem>
                            {categoryOptions.map((cat) => (
                                <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | 'PUBLISHED' | 'DRAFT')}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos los estados</SelectItem>
                            <SelectItem value="PUBLISHED">Publicados</SelectItem>
                            <SelectItem value="DRAFT">Borradores</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-card rounded shadow-sm border border-border dark:border-none overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                            <TableHead className="w-[300px] text-xs font-bold uppercase tracking-wider pl-6">Producto</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider">SKU</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider">Estado</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider">Oferta</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider">Precio</TableHead>
                            <TableHead className="text-xs font-bold uppercase tracking-wider">Stock por Talla</TableHead>
                            <TableHead className="text-right text-xs font-bold uppercase tracking-wider pr-6">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-0">
                                    <TableEmptyState
                                        title={hasFilters ? 'No hay productos que coincidan' : 'Sin productos todavía'}
                                        description={hasFilters
                                            ? 'Intenta con otros filtros o limpia la búsqueda.'
                                            : 'Agrega productos al catálogo para verlos aquí.'}
                                        actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
                                        onAction={hasFilters ? clearFilters : undefined}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedProducts.map((product) => (
                                <TableRow key={product.id} className="group hover:bg-muted/50 transition-colors">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-4">
                                            <ProductListThumbnail images={product.images} alt={product.name} />
                                            <div>
                                                <span className="font-bold text-sm text-foreground block">{product.name}</span>
                                                <span className="text-xs text-muted-foreground">{product.category.name}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-mono">{product.slug}</TableCell>

                                    <ProductStatusToggle product={product} />

                                    <TableCell>
                                        <span
                                            className={cn(
                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                                product.isSale
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                            )}
                                        >
                                            {product.isSale ? 'En Oferta' : 'Normal'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm text-foreground font-bold">{formatPrice(product.price)}</TableCell>
                                    <TableCell>
                                        <StockBadgeList variants={product.variants || []} />
                                    </TableCell>

                                    <ProductRowButtons product={product} />
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                    className="border-t border-border"
                />
            </div>
        </div>
    );
}
