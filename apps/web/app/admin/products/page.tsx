'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '../../../src/components/ui/Button';
import { Plus, Edit, Trash2, Loader2, Package } from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../../src/services/productService';
import { Product } from '../../../src/types';
import AdminProductForm from '../../../src/components/admin/AdminProductForm';
import ProductListThumbnail from '../../../src/components/admin/ProductListThumbnail';
import { toast } from 'sonner';
import { confirm as confirmDialog } from '../../../src/utils/confirm';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import TablePagination from '@/components/admin/TablePagination';

const ProductTableSkeleton = () => (
    <div className="bg-white dark:bg-black rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
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
                            {[1, 2, 3, 4, 5].map((i) => (
                                <th key={i} className="px-6 py-4">
                                    <div className="h-2 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {[1, 2, 3, 4, 5].map((row) => (
                            <tr key={row}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-gray-100 dark:bg-gray-900 rounded"></div>
                                            <div className="h-3 w-16 bg-gray-100 dark:bg-gray-900 rounded"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 dark:bg-gray-900 rounded font-mono"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 dark:bg-gray-900 rounded font-mono"></div></td>
                                <td className="px-6 py-4"><div className="h-6 w-12 bg-gray-100 dark:bg-gray-900 rounded-full"></div></td>
                                <td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><div className="h-8 w-8 bg-gray-100 dark:bg-gray-900 rounded-lg"></div><div className="h-8 w-8 bg-gray-100 dark:bg-gray-900 rounded-lg"></div></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

function ProductsPageContent() {
    const [products, setProducts] = useState<Product[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const searchParams = useSearchParams();

    useEffect(() => {
        setIsMounted(true);
        loadProducts();

        // Check for specific actions in URL
        const action = searchParams.get('action');
        if (action === 'new') {
            openCreateModal();
        }
    }, [searchParams]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchProducts({ isPublished: 'all' });
            setProducts(data);
        } catch (error) {
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (data: Partial<Product>) => {
        try {
            const newProduct = await createProduct(data);
            setProducts(prev => prev ? [...prev, newProduct] : [newProduct]);
            setIsProductModalOpen(false);
            toast.success('Producto creado correctamente');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear producto';
            toast.error(errorMessage);
        }
    };

    const handleUpdateProduct = async (data: Partial<Product>) => {
        if (!editingProduct) return;
        try {
            const updated = await updateProduct(editingProduct.id, data);
            setProducts(prev => prev ? prev.map(p => p.id === updated.id ? updated : p) : null);
            setIsProductModalOpen(false);
            setEditingProduct(undefined);
            toast.success('Producto actualizado correctamente');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar producto';
            toast.error(errorMessage);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        const isConfirmed = await confirmDialog(
            '¿Estás seguro de que deseas eliminar este producto?',
            'Esta acción no se puede deshacer.'
        );

        if (!isConfirmed) return;

        try {
            await deleteProduct(id);
            setProducts(prev => prev ? prev.filter(p => p.id !== id) : null);
            toast.success('Producto eliminado correctamente');
        } catch (error) {
            toast.error('Error al eliminar producto');
        }
    };

    const openCreateModal = () => {
        setEditingProduct(undefined);
        setIsProductModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleQuickStatusToggle = async (productId: string, isPublished: boolean) => {
        const action = isPublished ? 'publicar' : 'borrador';

        const isConfirmed = await confirmDialog(
            `¿Cambiar estado?`,
            `¿Estás seguro de que deseas cambiar el estado a ${action}?`
        );

        if (!isConfirmed) return;

        try {
            setLoading(true);
            const updated = await updateProduct(productId, { isPublished });
            setProducts(prev => prev ? prev.map(p => p.id === updated.id ? updated : p) : null);
            toast.success(`Producto ${isPublished ? 'publicado' : 'movido a borradores'}`);
        } catch (error) {
            toast.error('Error al actualizar el estado');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(price);
    };

    // Calculate paginated products
    const totalItems = products?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = products?.slice(startIndex, startIndex + itemsPerPage) || [];

    // Reset to first page when itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Productos</h1>
                    <p className="text-muted-foreground text-sm">Gestiona el catálogo de tu tienda</p>
                </div>
                <Button onClick={openCreateModal} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </Button>
            </div>

            {(!isMounted || products === null) ? (
                <ProductTableSkeleton />
            ) : products.length === 0 ? (
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
            ) : (
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded">
                            <div className="bg-background p-4 rounded-full shadow-xl border border-border">
                                <Loader2 className="w-6 h-6 animate-spin text-foreground" />
                            </div>
                        </div>
                    )}
                    <div className="bg-card rounded shadow-sm border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                    <TableHead className="w-[300px] text-xs font-bold uppercase tracking-wider pl-6">Producto</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider">SKU</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider">Estado</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider">Oferta</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider">Precio</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider">Stock</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedProducts.map((product) => (
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
                                        <TableCell>
                                            <Select
                                                value={product.isPublished ? "published" : "draft"}
                                                onValueChange={(value) => handleQuickStatusToggle(product.id, value === "published")}
                                            >
                                                <SelectTrigger className={cn(
                                                    "h-7 w-[110px] text-[10px] uppercase font-bold rounded-full border-none focus:ring-0",
                                                    product.isPublished
                                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="published" className="text-[10px] uppercase font-bold">Publicado</SelectItem>
                                                    <SelectItem value="draft" className="text-[10px] uppercase font-bold">Borrador</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
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
                                            {(() => {
                                                const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                                                return (
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${totalStock >= 10
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : totalStock > 0
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400'
                                                        }`}>
                                                        {totalStock}u
                                                    </span>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <TablePagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            )}

            <AdminProductForm
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                initialData={editingProduct}
            />
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductTableSkeleton />}>
            <ProductsPageContent />
        </Suspense>
    );
}
