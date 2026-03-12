import React, { Suspense } from 'react';
import { fetchProducts } from '../../../src/services/productService';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import ProductListThumbnail from '../../../src/components/admin/ProductListThumbnail';
import { StockBadgeList } from '../../../src/components/admin/StockBadgeList';
import { ProductStatusToggle, ProductRowButtons } from '../../../src/components/admin/ProductRowActions';
import { ProductsClientManager } from '../../../src/components/admin/ProductsClientManager';
import { Loader2, Package } from 'lucide-react';

const ProductTableSkeleton = () => (
    <div className="bg-white dark:bg-black rounded shadow-sm border border-gray-200 dark:border-none overflow-hidden relative">
        <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="bg-white dark:bg-black p-4 rounded-full shadow-xl border border-gray-100 dark:border-gray-800">
                <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" />
            </div>
        </div>
        <div className="animate-pulse">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <th key={i} className="px-6 py-4">
                                    <div className="h-2 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {[1, 2, 3, 4, 5].map((row) => (
                            <tr key={row}>
                                <td className="px-6 py-4"><div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 dark:bg-gray-900 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 dark:bg-gray-900 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-6 w-12 bg-gray-100 dark:bg-gray-900 rounded-full"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-100 dark:bg-gray-900 rounded font-mono"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 dark:bg-gray-900 rounded"></div></td>
                                <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-100 dark:bg-gray-900 rounded-lg ml-auto"></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

async function ProductsList() {
    // Note: In a real app, you might want to consider pagination params for fetching
    const products = await fetchProducts({ isPublished: 'all' });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(price);
    };

    if (products.length === 0) {
        return (
            <div className="bg-card rounded shadow-sm border border-border p-24 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="bg-muted p-4 rounded-full">
                        <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground">No hay productos registrados</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        Comienza añadiendo tu primer producto al catálogo.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ProductsClientManager>
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
                        {products.map((product) => (
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
                                <TableCell className="text-sm text-muted-foreground font-mono text-xs">{product.slug}</TableCell>

                                {/* Status Column */}
                                <ProductStatusToggle product={product} />

                                <TableCell>
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        product.isSale
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                    )}>
                                        {product.isSale ? "En Oferta" : "Normal"}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-foreground font-bold">{formatPrice(product.price)}</TableCell>
                                <TableCell>
                                    <StockBadgeList variants={product.variants || []} />
                                </TableCell>

                                {/* Actions Column at the end */}
                                <ProductRowButtons product={product} />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </ProductsClientManager>
    );
}

export default function ProductsPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            <Suspense fallback={<ProductTableSkeleton />}>
                <ProductsList />
            </Suspense>
        </div>
    );
}
