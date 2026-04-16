"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';
import AdminProductForm from '@/components/admin/products/AdminProductForm';
import { createProduct, updateProduct } from '@/services/productService';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

interface AdminProductsContextType {
    openEditModal: (product: Product) => void;
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

    return (
        <AdminProductsContext.Provider value={{ openEditModal }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Productos</h1>
                    <p className="text-muted-foreground text-sm">Gestiona el catálogo de tu tienda</p>
                </div>
                <Button onClick={openCreateModal} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </Button>
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
