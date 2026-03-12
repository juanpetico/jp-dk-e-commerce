"use client";

import React, { useState } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { updateProduct, deleteProduct } from '@/services/productService';
import { Product } from '@/types';
import { toast } from 'sonner';
import { confirm as confirmDialog } from '@/utils/confirm';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { TableCell } from "@/components/ui/table";
import { useAdminProducts } from './ProductsClientManager';

export const ProductStatusToggle = ({ product }: { product: Product }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleQuickStatusToggle = async (isPublished: boolean) => {
        const action = isPublished ? 'publicar' : 'borrador';

        const isConfirmed = await confirmDialog(
            `¿Cambiar estado?`,
            `¿Estás seguro de que deseas cambiar el estado a ${action}?`
        );

        if (!isConfirmed) return;

        try {
            setLoading(true);
            await updateProduct(product.id, { isPublished });
            toast.success(`Producto ${isPublished ? 'publicado' : 'movido a borradores'}`);
            router.refresh();
        } catch (error) {
            toast.error('Error al actualizar el estado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TableCell>
            <Select
                value={product.isPublished ? "published" : "draft"}
                onValueChange={(value) => handleQuickStatusToggle(value === "published")}
                disabled={loading}
            >
                <SelectTrigger className={cn(
                    "h-7 w-[110px] text-[10px] uppercase font-bold rounded-full border-none focus:ring-0 shadow-none",
                    product.isPublished
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                )}>
                    {loading ? <Loader2 className="w-3 h-3 animate-spin mx-auto" aria-hidden="true" /> : <SelectValue />}
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="published" className="text-[10px] uppercase font-bold">Publicado</SelectItem>
                    <SelectItem value="draft" className="text-[10px] uppercase font-bold">Borrador</SelectItem>
                </SelectContent>
            </Select>
        </TableCell>
    );
};

export const ProductRowButtons = ({ product }: { product: Product }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { openEditModal } = useAdminProducts();

    const handleDelete = async () => {
        const isConfirmed = await confirmDialog(
            '¿Estás seguro de que deseas eliminar este producto?',
            'Esta acción no se puede deshacer.'
        );

        if (!isConfirmed) return;

        try {
            setLoading(true);
            await deleteProduct(product.id);
            toast.success('Producto eliminado correctamente');
            router.refresh();
        } catch (error) {
            toast.error('Error al eliminar producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TableCell className="text-right pr-6">
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => openEditModal(product)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    title="Editar"
                    disabled={loading}
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Eliminar"
                    disabled={loading}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </TableCell>
    );
};
