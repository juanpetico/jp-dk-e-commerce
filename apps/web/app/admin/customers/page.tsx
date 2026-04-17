'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Search, Loader2, UserCog } from 'lucide-react';
import CustomerDrawer from '../../../src/components/admin/users/CustomerDrawer';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '../../../src/components/ui/Button';
import { cn } from '@/lib/utils';
import { fetchUsers } from '../../../src/services/userService';
import { User as Customer } from '../../../src/types';
import { useUser } from '../../../src/store/UserContext';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';

export default function CustomersPage() {
    const router = useRouter();
    const { user: currentUser } = useUser();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'CLIENT' | 'SUPERADMIN'>('ALL');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const openDrawer = (id: string) => {
        setDrawerUserId(id);
        setDrawerOpen(true);
    };
    const closeDrawer = () => setDrawerOpen(false);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                const data = await fetchUsers({ role: roleFilter });
                setCustomers(data);
                setError(null);
            } catch (err) {
                console.error('Error loading users:', err);
                setError('Error al cargar la lista de clientes. Por favor intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [roleFilter]);

    const formatPrice = (price: number | undefined) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price || 0);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const filteredCustomers = customers.filter((customer) => {
        const matchesSearch = (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const hasFilters = searchTerm.trim() !== '' || roleFilter !== 'ALL';

    const totalClientes = customers.length;
    const totalLtv = customers.reduce((acc, customer) => acc + (customer.totalSpent || 0), 0);
    const gastoPromedioLtv = totalClientes > 0 ? totalLtv / totalClientes : 0;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const nuevosUltimos30Dias = customers.filter((customer) => {
        if (!customer.createdAt) return false;
        const createdAt = new Date(customer.createdAt).getTime();
        return !Number.isNaN(createdAt) && createdAt >= thirtyDaysAgo;
    }).length;

    const totalItems = filteredCustomers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, itemsPerPage]);

    const handleManageAsUser = (userId: string) => {
        router.push(`/superadmin/users?userId=${userId}`);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('ALL');
    };

    return (
        <>
        <div className="space-y-6 animate-fade-in text-foreground">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-baseline gap-3">
                        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Clientes</h1>
                        {!loading && <span className="text-sm font-bold text-muted-foreground">{filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente' : 'clientes'}</span>}
                    </div>
                    <p className="text-muted-foreground text-sm">Gestiona usuarios y roles</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded border border-border bg-card p-4 shadow-sm">
                    <p className="font-display text-3xl font-black tracking-tight text-foreground">{totalClientes}</p>
                    <p className="text-sm text-muted-foreground">Total Clientes</p>
                </div>

                <div className="rounded border border-border bg-card p-4 shadow-sm">
                    <p className="font-display text-3xl font-black tracking-tight text-foreground">{formatPrice(gastoPromedioLtv)}</p>
                    <p className="text-sm text-muted-foreground">Gasto Promedio (LTV)</p>
                </div>

                <div className="rounded border border-border bg-card p-4 shadow-sm">
                    <p className="font-display text-3xl font-black tracking-tight text-foreground">{nuevosUltimos30Dias}</p>
                    <p className="text-sm text-muted-foreground">Nuevos (Últimos 30 días)</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 rounded border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                    <Select value={roleFilter} onValueChange={(value: 'ALL' | 'ADMIN' | 'CLIENT' | 'SUPERADMIN') => setRoleFilter(value)}>
                        <SelectTrigger className="w-full md:w-[170px]">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos</SelectItem>
                            <SelectItem value="CLIENT">Clientes</SelectItem>
                            <SelectItem value="ADMIN">Administradores</SelectItem>
                            <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
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
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground animate-pulse">Cargando clientes...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-destructive">
                            <p>{error}</p>
                            <Button variant="outline" onClick={() => window.location.reload()}>Reintentar</Button>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Gastado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Pedidos</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Último Pedido</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedCustomers.length > 0 ? (
                                    paginatedCustomers.map((customer) => (
                                        <tr
                            key={customer.id}
                            className="hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => openDrawer(customer.id)}
                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-display font-bold text-xs uppercase">
                                                        {(customer.name || customer.email).charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-foreground">{customer.name || 'Sin nombre'}</div>
                                                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${customer.role === 'SUPERADMIN'
                                                    ? 'bg-red-100 text-red-700'
                                                    : customer.role === 'ADMIN'
                                                        ? 'bg-foreground text-background'
                                                        : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {customer.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-foreground">{formatPrice(customer.totalSpent)}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-foreground">{customer.ordersCount || 0}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-foreground">{formatDate(customer.lastOrder)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`w-2 h-2 rounded-full inline-block ${customer.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {currentUser?.role === 'SUPERADMIN' && (
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleManageAsUser(customer.id);
                                                            }}
                                                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                                            title="Gestionar como usuario"
                                                        >
                                                            <UserCog className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-0 py-0">
                                            <TableEmptyState
                                                title={hasFilters ? 'No hay clientes que coincidan' : 'Sin clientes todavía'}
                                                description={hasFilters
                                                    ? 'Intenta con otros filtros o limpia la búsqueda.'
                                                    : 'Cuando se registren clientes, aparecerán en esta tabla.'}
                                                actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
                                                onAction={hasFilters ? clearFilters : undefined}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {!loading && !error && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Mostrar</span>
                                <Select
                                    value={itemsPerPage.toString()}
                                    onValueChange={(value) => setItemsPerPage(parseInt(value, 10))}
                                >
                                    <SelectTrigger className="h-8 w-[70px] text-xs font-bold rounded-md bg-background border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5" className="text-xs font-bold">5</SelectItem>
                                        <SelectItem value="10" className="text-xs font-bold">10</SelectItem>
                                        <SelectItem value="20" className="text-xs font-bold">20</SelectItem>
                                        <SelectItem value="50" className="text-xs font-bold">50</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-xs font-bold text-muted-foreground uppercase">por página</span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase border-l border-border pl-4">
                                Mostrando <span className="text-foreground">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-foreground">{totalItems}</span>
                            </span>
                        </div>

                        {totalPages > 1 && (
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className={cn(currentPage === 1 && 'pointer-events-none opacity-50 cursor-not-allowed')}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        onClick={() => setCurrentPage(page)}
                                                        isActive={currentPage === page}
                                                        className="h-8 w-8 text-xs font-bold cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }

                                        if (page === currentPage - 2 || page === currentPage + 2) {
                                            return (
                                                <PaginationItem key={page}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        return null;
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className={cn(currentPage === totalPages && 'pointer-events-none opacity-50 cursor-not-allowed')}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>
        </div>

        <CustomerDrawer userId={drawerUserId} open={drawerOpen} onClose={closeDrawer} />
        </>
    );
}
