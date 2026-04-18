import React from 'react';
import Link from 'next/link';
import { ExternalLink, PenLine, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Category } from '@/types';

interface CategoriesPageTableProps {
    categories: Category[];
    basePath: string;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
}

export default function CategoriesPageTable({
    categories,
    basePath,
    onEdit,
    onDelete,
}: CategoriesPageTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent dark:border-gray-800">
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Nombre</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Productos</TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Estado</TableHead>
                    <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Acciones</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {categories.map((category) => {
                    const count = category._count?.products ?? 0;
                    const isVisible = category.isPublished ?? true;

                    return (
                        <TableRow key={category.id} className="transition-colors hover:bg-muted/40">
                            <TableCell className="px-6 py-4 text-sm font-bold text-foreground">{category.name}</TableCell>

                            <TableCell className="px-6 py-4">
                                {count > 0 ? (
                                    <Link
                                        href={`${basePath}/products?category=${category.slug}`}
                                        className="inline-flex items-center gap-1 rounded-sm bg-foreground/10 px-2 py-1 text-xs font-bold text-foreground transition-colors hover:bg-foreground/20"
                                    >
                                        {count} {count === 1 ? 'producto' : 'productos'}
                                        <ExternalLink className="h-3 w-3 opacity-60" />
                                    </Link>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Sin productos</span>
                                )}
                            </TableCell>

                            <TableCell className="px-6 py-4">
                                <div className="inline-flex items-center">
                                    <span
                                        className={`inline-block h-2 w-2 rounded-full ${
                                            isVisible ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    />
                                </div>
                            </TableCell>

                            <TableCell className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(category)}
                                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                        title="Editar"
                                    >
                                        <PenLine className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(category)}
                                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
