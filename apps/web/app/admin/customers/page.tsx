'use client';

import React, { useState } from 'react';
import { Button } from '../../../src/components/ui/Button';
import { Download } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Customer {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'CLIENT';
    totalSpent: number;
    ordersCount: number;
    lastOrder: string;
    status: 'Active' | 'Inactive';
}

export default function CustomersPage() {
    // 2. Customers Mock Data from dashboard.tsx
    const [customers] = useState<Customer[]>([
        { id: 'u1', name: 'Juan Pérez', email: 'juan@example.com', role: 'CLIENT', totalSpent: 150000, ordersCount: 5, lastOrder: '2024-08-18', status: 'Active' },
        { id: 'u2', name: 'Admin User', email: 'admin@jpdk.cl', role: 'ADMIN', totalSpent: 0, ordersCount: 0, lastOrder: '-', status: 'Active' },
        { id: 'u3', name: 'Maria Gonzalez', email: 'maria@example.com', role: 'CLIENT', totalSpent: 25990, ordersCount: 1, lastOrder: '2024-08-17', status: 'Active' },
        { id: 'u4', name: 'Pedro Pascal', email: 'pedro@mandalorian.com', role: 'CLIENT', totalSpent: 89900, ordersCount: 1, lastOrder: '2024-08-16', status: 'Inactive' },
    ]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    // Calculate paginated customers
    const totalItems = customers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = customers.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when itemsPerPage changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div className="space-y-6 animate-fade-in text-foreground">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Clientes</h1>
                    <p className="text-muted-foreground text-sm">Gestiona usuarios y roles</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                </Button>
            </div>

            <div className="bg-card rounded shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Gastado</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Pedidos</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Último Pedido</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-display font-bold text-xs">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-foreground">{customer.name}</div>
                                                <div className="text-xs text-muted-foreground">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider ${customer.role === 'ADMIN' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {customer.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-foreground">{formatPrice(customer.totalSpent)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-foreground">{customer.ordersCount}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{customer.lastOrder}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`w-2 h-2 rounded-full inline-block ${customer.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Mostrar</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => setItemsPerPage(parseInt(value))}
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
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
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
                                                    className="h-8 w-8 text-xs font-bold"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    } else if (
                                        page === currentPage - 2 ||
                                        page === currentPage + 2
                                    ) {
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
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
        </div>
    );
}
