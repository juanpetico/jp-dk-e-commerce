'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, FolderOpen, Plus, PenLine, Trash2, AlertTriangle, ExternalLink, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { fetchCategories, createCategory, deleteCategory, patchCategory } from '@/services/categoryService';
import TablePagination from '@/components/admin/shared/TablePagination';
import { Category } from '@/types';
import { toast } from 'sonner';
import { confirm } from '@/utils/confirm';
import Link from 'next/link';

export default function CategoriesPage() {
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
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
    const [productsFilter, setProductsFilter] = useState<'ALL' | 'WITH' | 'WITHOUT'>('ALL');
    const [sortBy, setSortBy] = useState<'NAME_ASC' | 'NAME_DESC' | 'PRODUCTS_ASC' | 'PRODUCTS_DESC'>('NAME_ASC');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, productsFilter, sortBy]);

    const filteredCategories = useMemo(() => {
        let result = [...categories];

        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter((c) => c.name.toLowerCase().includes(q));
        }
        if (statusFilter === 'VISIBLE') result = result.filter((c) => c.isPublished ?? true);
        if (statusFilter === 'HIDDEN')  result = result.filter((c) => !(c.isPublished ?? true));
        if (productsFilter === 'WITH')    result = result.filter((c) => (c._count?.products ?? 0) > 0);
        if (productsFilter === 'WITHOUT') result = result.filter((c) => (c._count?.products ?? 0) === 0);

        result.sort((a, b) => {
            if (sortBy === 'NAME_ASC')       return a.name.localeCompare(b.name);
            if (sortBy === 'NAME_DESC')      return b.name.localeCompare(a.name);
            if (sortBy === 'PRODUCTS_ASC')   return (a._count?.products ?? 0) - (b._count?.products ?? 0);
            if (sortBy === 'PRODUCTS_DESC')  return (b._count?.products ?? 0) - (a._count?.products ?? 0);
            return 0;
        });

        return result;
    }, [categories, debouncedSearch, statusFilter, productsFilter, sortBy]);

    const hasFilters = debouncedSearch !== '' || statusFilter !== 'ALL' || productsFilter !== 'ALL' || sortBy !== 'NAME_ASC';

    const clearFilters = () => {
        setSearchInput('');
        setDebouncedSearch('');
        setStatusFilter('ALL');
        setProductsFilter('ALL');
        setSortBy('NAME_ASC');
    };

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = createName.trim();

        if (!trimmed) {
            setCreateError('El nombre es obligatorio');
            return;
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            const newCat = await createCategory(trimmed);
            setCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
            setCreateOpen(false);
            setCreateName('');
            toast.success(`Categoría "${newCat.name}" creada`);
        } catch {
            setCreateError('Error al crear la categoría');
        } finally {
            setCreateLoading(false);
        }
    };

    const openEdit = (cat: Category) => {
        setEditTarget(cat);
        setEditName(cat.name);
        setEditIsPublished(cat.isPublished ?? true);
        setEditError('');
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            changes.push(`estado: ${prevIsPublished ? 'Visible' : 'Oculta'} -> ${editIsPublished ? 'Visible' : 'Oculta'}`);
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
                prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)).sort((a, b) => a.name.localeCompare(b.name))
            );
            setEditTarget(null);
            toast.success('Categoría actualizada correctamente');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al guardar los cambios de la categoría';
            toast.error(message);
            setEditError('Error al guardar los cambios de la categoría');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (cat: Category) => {
        const productCount = cat._count?.products ?? 0;

        if (productCount > 0) {
            setBlockedCategory(cat);
            return;
        }

        const confirmed = await confirm(
            '¿Eliminar categoría?',
            `¿Estás seguro de que deseas eliminar "${cat.name}"? Esta acción no se puede deshacer.`
        );
        if (!confirmed) return;

        try {
            await deleteCategory(cat.id);
            setCategories((prev) => prev.filter((c) => c.id !== cat.id));
            toast.success(`Categoría "${cat.name}" eliminada`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al eliminar la categoría';
            toast.error(message);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-foreground">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Categorías</h1>
                        {!loading && <span className="text-sm font-bold text-muted-foreground">{totalItems} {totalItems === 1 ? 'categoría' : 'categorías'}</span>}
                    </div>
                    <p className="text-muted-foreground text-sm">Gestiona las categorías del catálogo</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </Button>
                    <Button
                        onClick={() => {
                            setCreateName('');
                            setCreateError('');
                            setCreateOpen(true);
                        }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Categoría
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Buscar por nombre..."
                        className="pl-10 font-mono text-sm w-full"
                    />
                </div>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger className="w-full md:w-[160px]">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los estados</SelectItem>
                        <SelectItem value="VISIBLE">Visible</SelectItem>
                        <SelectItem value="HIDDEN">Oculta</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={productsFilter} onValueChange={(v) => setProductsFilter(v as typeof productsFilter)}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Productos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos los productos</SelectItem>
                        <SelectItem value="WITH">Con productos</SelectItem>
                        <SelectItem value="WITHOUT">Sin productos</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="NAME_ASC">Nombre A→Z</SelectItem>
                        <SelectItem value="NAME_DESC">Nombre Z→A</SelectItem>
                        <SelectItem value="PRODUCTS_DESC">Más productos</SelectItem>
                        <SelectItem value="PRODUCTS_ASC">Menos productos</SelectItem>
                    </SelectContent>
                </Select>

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs shrink-0">
                        Limpiar filtros
                    </Button>
                )}
            </div>

            <div className="bg-card rounded shadow-sm border border-border dark:border-none overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse">Cargando categorías...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-destructive">
                        <p>{error}</p>
                        <Button variant="outline" onClick={() => void load()}>Reintentar</Button>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="bg-muted p-4 rounded-full">
                            <FolderOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        {categories.length === 0 ? (
                            <>
                                <h3 className="font-bold text-lg text-foreground">No hay categorías</h3>
                                <p className="text-muted-foreground text-sm">Crea la primera categoría para organizar el catálogo.</p>
                                <Button onClick={() => setCreateOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nueva Categoría
                                </Button>
                            </>
                        ) : (
                            <>
                                <h3 className="font-bold text-lg text-foreground">Sin resultados</h3>
                                <p className="text-muted-foreground text-sm">Ninguna categoría coincide con los filtros aplicados.</p>
                                <Button variant="outline" size="sm" onClick={clearFilters}>
                                    Limpiar filtros
                                </Button>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nombre</TableHead>
                                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Productos</TableHead>
                                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Estado</TableHead>
                                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCategories.map((cat) => {
                                    const count = cat._count?.products ?? 0;
                                    const isVisible = cat.isPublished ?? true;

                                    return (
                                        <TableRow key={cat.id} className="transition-colors hover:bg-muted/40">
                                            <TableCell className="px-6 py-4 font-bold text-sm text-foreground">{cat.name}</TableCell>
                                            <TableCell className="px-6 py-4">
                                                {count > 0 ? (
                                                    <Link
                                                        href={`${basePath}/products?category=${cat.slug}`}
                                                        className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-sm bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                                                    >
                                                        {count} {count === 1 ? 'producto' : 'productos'}
                                                        <ExternalLink className="w-3 h-3 opacity-60" />
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Sin productos</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="inline-flex items-center">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${isVisible ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() => openEdit(cat)}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <PenLine className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => void handleDelete(cat)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

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

            <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false); }}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-sm bg-background rounded-2xl shadow-2xl border border-border">
                    <DialogHeader>
                        <DialogTitle className="font-display text-lg font-bold uppercase tracking-wider text-center">
                            Nueva Categoría
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Nombre</Label>
                            <Input
                                autoFocus
                                placeholder="Ej: Accesorios"
                                value={createName}
                                onChange={(e) => {
                                    setCreateName(e.target.value);
                                    setCreateError('');
                                }}
                                className="bg-muted/50 h-11"
                            />
                            {createError && <p className="text-destructive text-xs">{createError}</p>}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {createLoading ? 'Creando...' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-sm bg-background rounded-2xl shadow-2xl border border-border">
                    <DialogHeader>
                        <DialogTitle className="font-display text-lg font-bold uppercase tracking-wider text-center">
                            Editar Categoría
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Nombre</Label>
                            <Input
                                autoFocus
                                value={editName}
                                onChange={(e) => {
                                    setEditName(e.target.value);
                                    setEditError('');
                                }}
                                className="bg-muted/50 h-11"
                            />
                            {editError && <p className="text-destructive text-xs">{editError}</p>}
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                            <div>
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Visible en tienda</Label>
                                <p className="text-[10px] text-muted-foreground">Este cambio se guarda al confirmar la edición.</p>
                            </div>
                            <Switch
                                checked={editIsPublished}
                                onCheckedChange={setEditIsPublished}
                                disabled={editLoading}
                                aria-label="Cambiar visibilidad de la categoría"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {editLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!blockedCategory} onOpenChange={(open) => { if (!open) setBlockedCategory(null); }}>
                <DialogContent className="sm:max-w-sm bg-background rounded-2xl shadow-2xl border border-border">
                    <DialogHeader>
                        <div className="flex justify-center mb-2">
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <DialogTitle className="font-display text-lg font-bold uppercase tracking-wider text-center">
                            No se puede eliminar
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm pt-2">
                            La categoría <span className="font-bold text-foreground">&quot;{blockedCategory?.name}&quot;</span> tiene{' '}
                            <span className="font-bold text-foreground">{blockedCategory?._count?.products}</span>{' '}
                            {(blockedCategory?._count?.products ?? 0) === 1 ? 'producto asignado' : 'productos asignados'}.
                            Reasígnalos a otra categoría antes de eliminarla.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-2">
                        <Button variant="outline" onClick={() => setBlockedCategory(null)}>
                            Cerrar
                        </Button>
                        <Link href={`${basePath}/products?category=${blockedCategory?.slug}`}>
                            <Button
                                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full flex items-center gap-2"
                                onClick={() => setBlockedCategory(null)}
                            >
                                <ExternalLink className="w-4 h-4" />
                                Ver productos
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
