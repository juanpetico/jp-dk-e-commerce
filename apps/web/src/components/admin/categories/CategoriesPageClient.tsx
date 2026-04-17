'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import TablePagination from '@/components/admin/shared/TablePagination';
import { Category } from '@/types';
import { toast } from 'sonner';
import { confirm } from '@/utils/confirm';
import {
    createCategory,
    deleteCategory,
    fetchCategories,
    patchCategory,
} from '@/services/categoryService';
import CategoriesBlockedDialog from './CategoriesPage.blocked-dialog';
import CategoriesCreateDialog from './CategoriesPage.create-dialog';
import CategoriesPageEmpty from './CategoriesPage.empty';
import CategoriesEditDialog from './CategoriesPage.edit-dialog';
import CategoriesPageFilters from './CategoriesPage.filters';
import CategoriesPageHeader from './CategoriesPage.header';
import CategoriesPageTable from './CategoriesPage.table';
import {
    CategoryProductsFilter,
    CategorySortBy,
    CategoryStatusFilter,
} from './CategoriesPage.types';

export default function CategoriesPageClient() {
    const pathname = usePathname();
    const basePath = pathname?.startsWith('/superadmin') ? '/superadmin' : '/admin';

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [createOpen, setCreateOpen] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [editName, setEditName] = useState('');
    const [editIsPublished, setEditIsPublished] = useState(true);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const [blockedCategory, setBlockedCategory] = useState<Category | null>(null);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<CategoryStatusFilter>('ALL');
    const [productsFilter, setProductsFilter] = useState<CategoryProductsFilter>('ALL');
    const [sortBy, setSortBy] = useState<CategorySortBy>('NAME_ASC');

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
        return () => clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter, productsFilter, sortBy]);

    const filteredCategories = useMemo(() => {
        let result = [...categories];

        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            result = result.filter((category) => category.name.toLowerCase().includes(query));
        }

        if (statusFilter === 'VISIBLE') result = result.filter((category) => category.isPublished ?? true);
        if (statusFilter === 'HIDDEN') result = result.filter((category) => !(category.isPublished ?? true));
        if (productsFilter === 'WITH') result = result.filter((category) => (category._count?.products ?? 0) > 0);
        if (productsFilter === 'WITHOUT') result = result.filter((category) => (category._count?.products ?? 0) === 0);

        result.sort((a, b) => {
            if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
            if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
            if (sortBy === 'PRODUCTS_ASC') return (a._count?.products ?? 0) - (b._count?.products ?? 0);
            if (sortBy === 'PRODUCTS_DESC') return (b._count?.products ?? 0) - (a._count?.products ?? 0);
            return 0;
        });

        return result;
    }, [categories, debouncedSearch, statusFilter, productsFilter, sortBy]);

    const hasFilters =
        debouncedSearch !== '' ||
        statusFilter !== 'ALL' ||
        productsFilter !== 'ALL' ||
        sortBy !== 'NAME_ASC';

    const totalItems = filteredCategories.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

    const load = async () => {
        try {
            setLoading(true);
            const data = await fetchCategories();
            setCategories(data);
            setError(null);
        } catch {
            setError('Error al cargar las categorías. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmed = createName.trim();

        if (!trimmed) {
            setCreateError('El nombre es obligatorio');
            return;
        }

        setCreateLoading(true);
        setCreateError('');

        try {
            const newCategory = await createCategory(trimmed);
            setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
            setCreateOpen(false);
            setCreateName('');
            toast.success(`Categoría "${newCategory.name}" creada`);
        } catch {
            setCreateError('Error al crear la categoría');
        } finally {
            setCreateLoading(false);
        }
    };

    const openEdit = (category: Category) => {
        setEditTarget(category);
        setEditName(category.name);
        setEditIsPublished(category.isPublished ?? true);
        setEditError('');
    };

    const handleEdit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editTarget) return;

        const trimmedName = editName.trim();
        if (!trimmedName) {
            setEditError('El nombre es obligatorio');
            return;
        }

        const prevIsPublished = editTarget.isPublished ?? true;
        const nameChanged = trimmedName !== editTarget.name;
        const statusChanged = editIsPublished !== prevIsPublished;

        if (!nameChanged && !statusChanged) {
            setEditTarget(null);
            return;
        }

        const changes: string[] = [];
        if (nameChanged) changes.push(`nombre: "${editTarget.name}" -> "${trimmedName}"`);
        if (statusChanged) {
            changes.push(
                `estado: ${prevIsPublished ? 'Visible' : 'Oculta'} -> ${editIsPublished ? 'Visible' : 'Oculta'}`
            );
        }

        const confirmed = await confirm(
            '¿Guardar cambios de la categoría?',
            `Se aplicarán estos cambios: ${changes.join(' | ')}`
        );
        if (!confirmed) return;

        setEditLoading(true);
        setEditError('');
        try {
            const payload: Partial<Pick<Category, 'name' | 'isPublished'>> = {};
            if (nameChanged) payload.name = trimmedName;
            if (statusChanged) payload.isPublished = editIsPublished;

            const updated = await patchCategory(editTarget.id, payload);
            setCategories((prev) =>
                prev
                    .map((category) => (category.id === updated.id ? { ...category, ...updated } : category))
                    .sort((a, b) => a.name.localeCompare(b.name))
            );
            setEditTarget(null);
            toast.success('Categoría actualizada correctamente');
        } catch (requestError: unknown) {
            const message =
                requestError instanceof Error
                    ? requestError.message
                    : 'Error al guardar los cambios de la categoría';
            toast.error(message);
            setEditError('Error al guardar los cambios de la categoría');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (category: Category) => {
        const productCount = category._count?.products ?? 0;

        if (productCount > 0) {
            setBlockedCategory(category);
            return;
        }

        const confirmed = await confirm(
            '¿Eliminar categoría?',
            `¿Estás seguro de que deseas eliminar "${category.name}"? Esta acción no se puede deshacer.`
        );
        if (!confirmed) return;

        try {
            await deleteCategory(category.id);
            setCategories((prev) => prev.filter((item) => item.id !== category.id));
            toast.success(`Categoría "${category.name}" eliminada`);
        } catch (requestError: unknown) {
            const message = requestError instanceof Error ? requestError.message : 'Error al eliminar la categoría';
            toast.error(message);
        }
    };

    return (
        <div className="animate-fade-in space-y-6 text-foreground">
            <CategoriesPageHeader
                loading={loading}
                totalItems={totalItems}
                onCreate={() => {
                    setCreateName('');
                    setCreateError('');
                    setCreateOpen(true);
                }}
            />

            <CategoriesPageFilters
                searchInput={searchInput}
                statusFilter={statusFilter}
                productsFilter={productsFilter}
                sortBy={sortBy}
                hasFilters={hasFilters}
                onSearchInputChange={setSearchInput}
                onStatusFilterChange={setStatusFilter}
                onProductsFilterChange={setProductsFilter}
                onSortByChange={setSortBy}
                onClearFilters={() => {
                    setSearchInput('');
                    setDebouncedSearch('');
                    setStatusFilter('ALL');
                    setProductsFilter('ALL');
                    setSortBy('NAME_ASC');
                }}
            />

            <div className="overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="animate-pulse text-muted-foreground">Cargando categorías...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
                        <p>{error}</p>
                        <Button variant="outline" onClick={() => void load()}>Reintentar</Button>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <CategoriesPageEmpty
                        hasAnyCategories={categories.length > 0}
                        onCreate={() => setCreateOpen(true)}
                        onClearFilters={() => {
                            setSearchInput('');
                            setDebouncedSearch('');
                            setStatusFilter('ALL');
                            setProductsFilter('ALL');
                            setSortBy('NAME_ASC');
                        }}
                    />
                ) : (
                    <>
                        <CategoriesPageTable
                            categories={paginatedCategories}
                            basePath={basePath}
                            onEdit={openEdit}
                            onDelete={(category) => void handleDelete(category)}
                        />

                        <TablePagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(next) => {
                                setItemsPerPage(next);
                                setCurrentPage(1);
                            }}
                            className="border-t border-border"
                        />
                    </>
                )}
            </div>

            <CategoriesCreateDialog
                open={createOpen}
                createName={createName}
                createLoading={createLoading}
                createError={createError}
                onOpenChange={(open) => {
                    if (!open) setCreateOpen(false);
                }}
                onCreateNameChange={(value) => {
                    setCreateName(value);
                    setCreateError('');
                }}
                onSubmit={handleCreate}
            />

            <CategoriesEditDialog
                open={!!editTarget}
                editName={editName}
                editIsPublished={editIsPublished}
                editLoading={editLoading}
                editError={editError}
                onOpenChange={(open) => {
                    if (!open) setEditTarget(null);
                }}
                onEditNameChange={(value) => {
                    setEditName(value);
                    setEditError('');
                }}
                onEditIsPublishedChange={setEditIsPublished}
                onSubmit={handleEdit}
            />

            <CategoriesBlockedDialog
                basePath={basePath}
                blockedCategory={blockedCategory}
                onOpenChange={(open) => {
                    if (!open) setBlockedCategory(null);
                }}
                onClose={() => setBlockedCategory(null)}
            />
        </div>
    );
}
