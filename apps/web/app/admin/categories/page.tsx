'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, FolderOpen, Plus, PenLine, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/services/categoryService';
import { Category } from '@/types';
import { toast } from 'sonner';
import { confirm } from '@/utils/confirm';
import Link from 'next/link';

export default function CategoriesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const basePath = pathname?.startsWith('/superadmin') ? '/superadmin' : '/admin';
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal: crear
    const [createOpen, setCreateOpen] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    // Modal: renombrar
    const [renameTarget, setRenameTarget] = useState<Category | null>(null);
    const [renameName, setRenameName] = useState('');
    const [renameLoading, setRenameLoading] = useState(false);
    const [renameError, setRenameError] = useState('');

    // Modal: bloqueo por productos
    const [blockedCategory, setBlockedCategory] = useState<Category | null>(null);

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

    useEffect(() => { load(); }, []);

    // --- Crear ---
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createName.trim()) {
            setCreateError('El nombre es obligatorio');
            return;
        }
        setCreateLoading(true);
        setCreateError('');
        try {
            const newCat = await createCategory(createName.trim());
            setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
            setCreateOpen(false);
            setCreateName('');
            toast.success(`Categoría "${newCat.name}" creada`);
        } catch {
            setCreateError('Error al crear la categoría');
        } finally {
            setCreateLoading(false);
        }
    };

    // --- Renombrar ---
    const openRename = (cat: Category) => {
        setRenameTarget(cat);
        setRenameName(cat.name);
        setRenameError('');
    };

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!renameTarget) return;
        if (!renameName.trim()) {
            setRenameError('El nombre es obligatorio');
            return;
        }
        if (renameName.trim() === renameTarget.name) {
            setRenameTarget(null);
            return;
        }
        setRenameLoading(true);
        setRenameError('');
        try {
            const updated = await updateCategory(renameTarget.id, renameName.trim());
            setCategories(prev =>
                prev.map(c => c.id === updated.id ? { ...c, ...updated } : c)
                    .sort((a, b) => a.name.localeCompare(b.name))
            );
            setRenameTarget(null);
            toast.success(`Categoría renombrada a "${updated.name}"`);
        } catch {
            setRenameError('Error al renombrar la categoría');
        } finally {
            setRenameLoading(false);
        }
    };

    // --- Eliminar ---
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
            setCategories(prev => prev.filter(c => c.id !== cat.id));
            toast.success(`Categoría "${cat.name}" eliminada`);
        } catch (err: any) {
            toast.error(err?.message || 'Error al eliminar la categoría');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-foreground">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Categorías</h1>
                    <p className="text-muted-foreground text-sm">Gestiona las categorías del catálogo</p>
                </div>
                <Button
                    onClick={() => { setCreateName(''); setCreateError(''); setCreateOpen(true); }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Categoría
                </Button>
            </div>

            {/* Tabla */}
            <div className="bg-card rounded shadow-sm border border-border dark:border-none overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse">Cargando categorías...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-destructive">
                        <p>{error}</p>
                        <Button variant="outline" onClick={load}>Reintentar</Button>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="bg-muted p-4 rounded-full">
                            <FolderOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">No hay categorías</h3>
                        <p className="text-muted-foreground text-sm">Crea la primera categoría para organizar el catálogo.</p>
                        <Button
                            onClick={() => setCreateOpen(true)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Categoría
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Slug</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Productos</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {categories.map((cat) => {
                                    const count = cat._count?.products ?? 0;
                                    return (
                                        <tr key={cat.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-foreground">{cat.name}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                                            <td className="px-6 py-4">
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
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() => openRename(cat)}
                                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                        title="Renombrar"
                                                    >
                                                        <PenLine className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="px-6 py-4 border-t border-border">
                            <span className="text-xs font-bold text-muted-foreground uppercase">
                                {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'} en total
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Crear categoría */}
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
                                onChange={(e) => { setCreateName(e.target.value); setCreateError(''); }}
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

            {/* Modal: Renombrar categoría */}
            <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
                <DialogContent aria-describedby={undefined} className="sm:max-w-sm bg-background rounded-2xl shadow-2xl border border-border">
                    <DialogHeader>
                        <DialogTitle className="font-display text-lg font-bold uppercase tracking-wider text-center">
                            Renombrar Categoría
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRename} className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Nuevo Nombre</Label>
                            <Input
                                autoFocus
                                value={renameName}
                                onChange={(e) => { setRenameName(e.target.value); setRenameError(''); }}
                                className="bg-muted/50 h-11"
                            />
                            {renameError && <p className="text-destructive text-xs">{renameError}</p>}
                            <p className="text-[10px] text-muted-foreground">El slug se regenerará automáticamente.</p>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={renameLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {renameLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal: Bloqueo por productos asignados */}
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
                            La categoría <span className="font-bold text-foreground">"{blockedCategory?.name}"</span> tiene{' '}
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
