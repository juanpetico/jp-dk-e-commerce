import React from 'react';
import { UserCog } from 'lucide-react';
import TableEmptyState from '@/components/admin/shared/TableEmptyState';
import { User as Customer } from '@/types';
import { formatCustomerDate, formatCustomerPrice } from './CustomersPage.utils';

interface CustomersPageTableProps {
    customers: Customer[];
    hasFilters: boolean;
    canManageAsUser: boolean;
    onOpenDrawer: (userId: string) => void;
    onManageAsUser: (userId: string) => void;
    onClearFilters: () => void;
}

export default function CustomersPageTable({
    customers,
    hasFilters,
    canManageAsUser,
    onOpenDrawer,
    onManageAsUser,
    onClearFilters,
}: CustomersPageTableProps) {
    return (
        <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/50">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Usuario</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rol</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Gastado</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Pedidos</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ultimo Pedido</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
                </tr>
            </thead>

            <tbody className="divide-y divide-border">
                {customers.length > 0 ? (
                    customers.map((customer) => (
                        <tr
                            key={customer.id}
                            className="cursor-pointer transition-colors hover:bg-muted/50"
                            onClick={() => onOpenDrawer(customer.id)}
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground font-display text-xs font-bold uppercase text-background">
                                        {(customer.name || customer.email).charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-foreground">{customer.name || 'Sin nombre'}</div>
                                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <span
                                    className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                        customer.role === 'SUPERADMIN'
                                            ? 'bg-red-100 text-red-700'
                                            : customer.role === 'ADMIN'
                                              ? 'bg-foreground text-background'
                                              : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {customer.role}
                                </span>
                            </td>

                            <td className="px-6 py-4 font-mono text-sm text-foreground">
                                {formatCustomerPrice(customer.totalSpent)}
                            </td>

                            <td className="px-6 py-4 text-sm font-bold text-foreground">{customer.ordersCount || 0}</td>

                            <td className="px-6 py-4 text-sm font-medium text-foreground">
                                {formatCustomerDate(customer.lastOrder)}
                            </td>

                            <td className="px-6 py-4 text-right">
                                <span
                                    className={`inline-block h-2 w-2 rounded-full ${
                                        customer.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                />
                            </td>

                            <td className="px-6 py-4 text-right">
                                {canManageAsUser && (
                                    <div className="flex justify-end">
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onManageAsUser(customer.id);
                                            }}
                                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                            title="Gestionar como usuario"
                                        >
                                            <UserCog className="h-4 w-4" />
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
                                description={
                                    hasFilters
                                        ? 'Intenta con otros filtros o limpia la búsqueda.'
                                        : 'Cuando se registren clientes, aparecerán en esta tabla.'
                                }
                                actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
                                onAction={hasFilters ? onClearFilters : undefined}
                            />
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
