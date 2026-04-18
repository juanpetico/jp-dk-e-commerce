"use client";

import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Product } from '@/types';
import AdminProductForm from '@/components/admin/products/AdminProductForm';
import { createProduct, updateProduct } from '@/services/productService';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

interface AdminProductsContextType {
    openEditModal: (product: Product) => void;
    setFilteredCount: (n: number) => void;
    setCurrentExportCount: (n: number) => void;
    setExportHandlers: (
        handlers: {
            pdfCurrent: () => void;
            excelCurrent: () => void;
            pdfAll: () => void;
            excelAll: () => void;
        } | null
    ) => void;
}

const AdminProductsContext = createContext<AdminProductsContextType | undefined>(undefined);

export const useAdminProducts = () => {
    const context = useContext(AdminProductsContext);
    if (!context) {
        throw new Error('useAdminProducts must be used within a ProductsClientManager');
    }
    return context;
};

interface ProductsClientManagerProps {
    children: React.ReactNode;
}

export const ProductsClientManager: React.FC<ProductsClientManagerProps> = ({ children }) => {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [filteredCount, setFilteredCount] = useState(0);
    const [currentExportCount, setCurrentExportCount] = useState(0);
    const exportHandlersRef = useRef<{
        pdfCurrent: () => void;
        excelCurrent: () => void;
        pdfAll: () => void;
        excelAll: () => void;
    } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'new') {
            openCreateModal();
        }
    }, [searchParams]);

    const openCreateModal = () => {
        setEditingProduct(undefined);
        setIsProductModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleCreateProduct = async (data: Partial<Product>) => {
        try {
            await createProduct(data);
            setIsProductModalOpen(false);
            toast.success('Producto creado correctamente');
            router.refresh();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear producto';
            toast.error(errorMessage);
        }
    };

    const handleUpdateProduct = async (data: Partial<Product>) => {
        if (!editingProduct) return;
        try {
            await updateProduct(editingProduct.id, data);
            setIsProductModalOpen(false);
            setEditingProduct(undefined);
            toast.success('Producto actualizado correctamente');
            router.refresh();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar producto';
            toast.error(errorMessage);
        }
    };

    const setExportHandlers = useCallback(
        (
            handlers: {
                pdfCurrent: () => void;
                excelCurrent: () => void;
                pdfAll: () => void;
                excelAll: () => void;
            } | null
        ) => {
            exportHandlersRef.current = handlers;
        },
        []
    );

    const handleExportPdf = () => {
        if (exportHandlersRef.current) {
            exportHandlersRef.current.pdfCurrent();
            return;
        }

        toast.error('No hay productos para exportar');
    };

    const handleExportExcel = () => {
        if (exportHandlersRef.current) {
            exportHandlersRef.current.excelCurrent();
            return;
        }

        toast.error('No hay productos para exportar');
    };

    const handleExportPdfAll = () => {
        if (exportHandlersRef.current) {
            exportHandlersRef.current.pdfAll();
            return;
        }

        toast.error('No hay productos para exportar');
    };

    const handleExportExcelAll = () => {
        if (exportHandlersRef.current) {
            exportHandlersRef.current.excelAll();
            return;
        }

        toast.error('No hay productos para exportar');
    };

    return (
        <AdminProductsContext.Provider value={{ openEditModal, setFilteredCount, setCurrentExportCount, setExportHandlers }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Productos</h1>
                        <span className="text-sm font-bold text-muted-foreground">{filteredCount} {filteredCount === 1 ? 'producto' : 'productos'}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Gestiona el catálogo de tu tienda</p>
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2" disabled={filteredCount === 0}>
                                <Download className="w-4 h-4" />
                                Exportar
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-56 p-1">
                            <button
                                className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                onClick={handleExportPdf}
                            >
                                Exportar PDF ({currentExportCount})
                            </button>
                            <button
                                className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                onClick={handleExportExcel}
                            >
                                Exportar Excel ({currentExportCount})
                            </button>
                            {filteredCount > currentExportCount && (
                                <>
                                    <div className="my-1 border-t border-border" />
                                    <button
                                        className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                        onClick={handleExportPdfAll}
                                    >
                                        PDF todos ({filteredCount})
                                    </button>
                                    <button
                                        className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                                        onClick={handleExportExcelAll}
                                    >
                                        Excel todos ({filteredCount})
                                    </button>
                                </>
                            )}
                        </PopoverContent>
                    </Popover>
                    <Button onClick={openCreateModal} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Producto
                    </Button>
                </div>
            </div>

            {children}

            <AdminProductForm
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                initialData={editingProduct}
            />
        </AdminProductsContext.Provider>
    );
};
