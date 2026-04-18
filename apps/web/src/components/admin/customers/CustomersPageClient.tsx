'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CustomerDrawer from '@/components/admin/users/CustomerDrawer';
import { Button } from '@/components/ui/Button';
import TablePagination from '@/components/admin/shared/TablePagination';
import { fetchUsers } from '@/services/userService';
import { exportRowsToExcel } from '@/services/exportExcelService';
import { User as Customer } from '@/types';
import { useUser } from '@/store/UserContext';
import CustomersPageFilters from './CustomersPage.filters';
import CustomersPageHeader from './CustomersPage.header';
import CustomersPageStats from './CustomersPage.stats';
import CustomersPageTable from './CustomersPage.table';
import { CustomerRoleFilter } from './CustomersPage.types';
import { formatCustomerPrice } from './CustomersPage.utils';

export default function CustomersPageClient() {
    const router = useRouter();
    const { user: currentUser } = useUser();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<CustomerRoleFilter>('ALL');

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
            } catch (requestError) {
                console.error('Error loading users:', requestError);
                setError('Error al cargar la lista de clientes. Por favor intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        void loadUsers();
    }, [roleFilter]);

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const query = searchTerm.toLowerCase();
            return (
                (customer.name || '').toLowerCase().includes(query) ||
                (customer.email || '').toLowerCase().includes(query)
            );
        });
    }, [customers, searchTerm]);

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

    const handleExport = () => {
        if (filteredCustomers.length === 0) {
            toast.error('No hay clientes para exportar');
            return;
        }

        const rows = filteredCustomers.map((customer) => ({
            ID: customer.id,
            Nombre: customer.name || 'Sin nombre',
            Email: customer.email,
            Rol: customer.role,
            Estado: customer.status === 'Active' ? 'Activo' : 'Inactivo',
            Pedidos: customer.ordersCount || 0,
            'Total Gastado': customer.totalSpent || 0,
            'Ultimo Pedido': customer.lastOrder ? new Date(customer.lastOrder).toLocaleString('es-CL') : '-',
            Registro: customer.createdAt ? new Date(customer.createdAt).toLocaleString('es-CL') : '-',
        }));

        exportRowsToExcel(rows, {
            fileNameBase: 'clientes',
            sheetName: 'Clientes',
        });
        toast.success('Archivo Excel generado con exito');
    };

    return (
        <>
            <div className="animate-fade-in space-y-6 text-foreground">
                <CustomersPageHeader loading={loading} visibleCount={filteredCustomers.length} onExport={handleExport} />

                <CustomersPageStats
                    totalClientes={totalClientes}
                    gastoPromedioLtv={formatCustomerPrice(gastoPromedioLtv)}
                    nuevosUltimos30Dias={nuevosUltimos30Dias}
                />

                <CustomersPageFilters
                    searchTerm={searchTerm}
                    roleFilter={roleFilter}
                    hasFilters={hasFilters}
                    onSearchTermChange={setSearchTerm}
                    onRoleFilterChange={setRoleFilter}
                    onClearFilters={clearFilters}
                />

                <div className="overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="animate-pulse text-muted-foreground">Cargando clientes...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20 text-destructive">
                                <p>{error}</p>
                                <Button variant="outline" onClick={() => window.location.reload()}>
                                    Reintentar
                                </Button>
                            </div>
                        ) : (
                            <CustomersPageTable
                                customers={paginatedCustomers}
                                hasFilters={hasFilters}
                                canManageAsUser={currentUser?.role === 'SUPERADMIN'}
                                onOpenDrawer={openDrawer}
                                onManageAsUser={handleManageAsUser}
                                onClearFilters={clearFilters}
                            />
                        )}
                    </div>

                    {!loading && !error && (
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
                    )}
                </div>
            </div>

            <CustomerDrawer userId={drawerUserId} open={drawerOpen} onClose={closeDrawer} />
        </>
    );
}
