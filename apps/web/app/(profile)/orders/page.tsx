'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../src/store/UserContext';
import { Button } from '../../../src/components/ui/Button';
import { Grid3x3, Filter, List, MoreVertical, Eye } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { generateOrderPDF } from "../../../src/services/orderReportService";
import { Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, subMonths, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
    const { user, isAuthenticated } = useUser();
    const router = useRouter();
    const [showFilter, setShowFilter] = useState(false);
    const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [filterTab, setFilterTab] = useState<'sort' | 'filter'>('sort');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Filter & Sort State
    const [sortBy, setSortBy] = useState<string>('date-desc');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>(undefined);

    // Persistence and Auth
    React.useEffect(() => {
        const savedViewMode = localStorage.getItem('ordersViewMode');
        if (savedViewMode === 'gallery' || savedViewMode === 'list') {
            setViewMode(savedViewMode);
        }

        if (!isAuthenticated || (user === null && !isAuthenticated)) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router]);

    React.useEffect(() => {
        localStorage.setItem('ordersViewMode', viewMode);
    }, [viewMode]);

    if (!user) {
        return null;
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    const translateStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'Pendiente',
            'CONFIRMED': 'Confirmado',
            'SHIPPED': 'Enviado',
            'DELIVERED': 'Entregado',
            'CANCELLED': 'Cancelado',
            'PROCESSING': 'Procesando',
            'PAID': 'Pagado'
        };
        return statusMap[status.toUpperCase()] || status;
    };

    const getFilteredAndSortedOrders = () => {
        if (!user.orders) return [];

        let filtered = [...user.orders];

        // Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status.toUpperCase() === statusFilter.toUpperCase());
        }

        // Date Filter
        const now = new Date();
        const today = startOfDay(now);

        if (dateFilter === 'custom' && dateRange?.from) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt || order.date);
                const from = startOfDay(dateRange.from!);
                const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);
                return orderDate >= from && orderDate <= to;
            });
        } else if (dateFilter !== 'all') {
            let startDate: Date;
            switch (dateFilter) {
                case 'today':
                    startDate = today;
                    break;
                case '7days':
                    startDate = subDays(today, 7);
                    break;
                case '30days':
                    startDate = subDays(today, 30);
                    break;
                case '90days':
                    startDate = subDays(today, 90);
                    break;
                case '12months':
                    startDate = subMonths(today, 12);
                    break;
                default:
                    startDate = new Date(0);
            }
            filtered = filtered.filter(order => new Date(order.createdAt || order.date) >= startDate);
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime();
                case 'date-asc':
                    return new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime();
                case 'total-desc':
                    return b.total - a.total;
                case 'total-asc':
                    return a.total - b.total;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredOrders = getFilteredAndSortedOrders();

    const isFilterActive = dateFilter !== 'all' || statusFilter !== 'all';

    const resetFilters = () => {
        setSortBy('date-desc');
        setDateFilter('all');
        setStatusFilter('all');
        setDateRange(undefined);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Top Navigation Removed - Handled by Layout */}

            <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground">Pedidos</h1>
                <div className="flex gap-2">
                    {/* Vista Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowViewDropdown(!showViewDropdown)}
                            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                            {viewMode === 'gallery' ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                            {viewMode === 'gallery' ? 'Galería' : 'Lista'}
                            <span className="text-xs">▼</span>
                        </button>

                        {showViewDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-popover text-popover-foreground border border-border rounded-lg shadow-xl z-20 py-1">
                                <button
                                    onClick={() => {
                                        setViewMode('gallery');
                                        setShowViewDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                    Galería
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('list');
                                        setShowViewDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    <List className="w-4 h-4" />
                                    Lista
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Botón Filtrar con Tooltip */}
                    <div className="relative group">
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 p-2 rounded transition-colors"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground border border-border text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-sm">
                            Filtro
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay oscuro cuando el filtro está abierto */}
            {showFilter && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setShowFilter(false)}
                />
            )}

            {/* Filter Modal - desliza desde la derecha */}
            <div className={`fixed top-0 right-0 h-full w-96 bg-background shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out border-l border-gray-300 ${showFilter ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header con pestañas */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setFilterTab('sort')}
                            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${filterTab === 'sort'
                                ? 'border-[var(--color-amber-900)] text-[var(--color-amber-900)]'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Ordenar
                        </button>
                        <button
                            onClick={() => setFilterTab('filter')}
                            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${filterTab === 'filter'
                                ? 'border-[var(--color-amber-900)] text-[var(--color-amber-900)]'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Filtrar
                        </button>
                    </div>

                    {/* Contenido scrolleable */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {filterTab === 'sort' ? (
                            /* Opciones de Ordenar */
                            <div className="space-y-6">
                                <RadioGroup value={sortBy} onValueChange={setSortBy}>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="date-desc" id="date-desc" />
                                        <Label htmlFor="date-desc" className="text-sm font-normal cursor-pointer">Del más reciente al más antiguo</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="date-asc" id="date-asc" />
                                        <Label htmlFor="date-asc" className="text-sm font-normal cursor-pointer">Del más antiguo al más reciente</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="total-desc" id="total-desc" />
                                        <Label htmlFor="total-desc" className="text-sm font-normal cursor-pointer">Total del pedido (de mayor a menor)</Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <RadioGroupItem value="total-asc" id="total-asc" />
                                        <Label htmlFor="total-asc" className="text-sm font-normal cursor-pointer">Total del pedido (de menor a mayor)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ) : (
                            /* Opciones de Filtrar */
                            <div className="space-y-8">
                                <div>
                                    <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Estado del pedido</h3>
                                    <RadioGroup value={statusFilter} onValueChange={setStatusFilter} className="space-y-3">
                                        {['all', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                                            <div key={status} className="flex items-center space-x-3">
                                                <RadioGroupItem value={status} id={`status-${status}`} />
                                                <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                                                    {status === 'all' ? 'Todos los estados' : translateStatus(status)}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className="border-t border-border pt-6">
                                    <h3 className="font-bold text-sm mb-4 text-foreground uppercase tracking-wider">Fecha del pedido</h3>
                                    <RadioGroup value={dateFilter} onValueChange={setDateFilter} className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="all" id="date-all" />
                                            <Label htmlFor="date-all" className="text-sm font-normal cursor-pointer">Todos</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="today" id="date-today" />
                                            <Label htmlFor="date-today" className="text-sm font-normal cursor-pointer">Hoy</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="7days" id="date-7days" />
                                            <Label htmlFor="date-7days" className="text-sm font-normal cursor-pointer">Últimos siete días</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="30days" id="date-30days" />
                                            <Label htmlFor="date-30days" className="text-sm font-normal cursor-pointer">Últimos 30 días</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="90days" id="date-90days" />
                                            <Label htmlFor="date-90days" className="text-sm font-normal cursor-pointer">Últimos 90 días</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="12months" id="date-12months" />
                                            <Label htmlFor="date-12months" className="text-sm font-normal cursor-pointer">Últimos 12 meses</Label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="custom" id="date-custom" />
                                            <Label htmlFor="date-custom" className="text-sm font-normal cursor-pointer">Personalizado</Label>
                                        </div>
                                    </RadioGroup>

                                    {dateFilter === 'custom' && (
                                        <div className="mt-4 pl-7 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !dateRange?.from && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateRange?.from ? (
                                                            dateRange?.to ? (
                                                                <>
                                                                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                                                    {format(dateRange.to, "dd/MM/yyyy")}
                                                                </>
                                                            ) : (
                                                                format(dateRange.from, "dd/MM/yyyy")
                                                            )
                                                        ) : (
                                                            <span>Seleccionar rango</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={dateRange?.from}
                                                        selected={dateRange}
                                                        onSelect={setDateRange}
                                                        numberOfMonths={1}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                        }
                    </div>

                    {/* Footer con botones */}
                    <div className="border-t border-border p-6 flex justify-between items-center bg-card">
                        <button
                            onClick={() => {
                                setSortBy('date-desc');
                                setDateFilter('all');
                                setStatusFilter('all');
                                setDateRange(undefined);
                            }}
                            className="text-[var(--color-amber-900)] text-sm font-medium hover:underline"
                        >
                            Limpiar todo
                        </button>
                        <button
                            onClick={() => setShowFilter(false)}
                            className="bg-[var(--color-amber-900)] text-white px-10 py-2.5 rounded font-bold text-sm hover:bg-[var(--color-amber-900)]/90 transition-colors shadow-md"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 relative">                {/* Orders List */}
                <div className="flex-1">
                    {(!filteredOrders || filteredOrders.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-lg border border-gray-300">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <Grid3x3 className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-foreground">
                                {isFilterActive ? 'No se encontraron pedidos con estos filtros' : 'No tienes pedidos aún'}
                            </h3>
                            <p className="text-muted-foreground mb-6 text-center max-w-sm">
                                {isFilterActive
                                    ? 'Intenta ajustar los criterios de búsqueda o limpiar los filtros seleccionados.'
                                    : 'Parece que no has realizado ninguna compra todavía. ¡Explora nuestro catálogo!.'}
                            </p>
                            {isFilterActive ? (
                                <Button
                                    onClick={resetFilters}
                                    className="px-8 rounded py-3 bg-[var(--color-amber-900)] text-white hover:bg-[var(--color-amber-900)]/90 normal-case font-bold"
                                >
                                    Limpiar Filtros
                                </Button>
                            ) : (
                                <Link href="/catalog">
                                    <Button
                                        className="px-8 rounded py-3 bg-[var(--color-amber-900)] text-white hover:bg-[var(--color-amber-900)]/90 normal-case font-bold"
                                    >
                                        Ver Catálogo
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : viewMode === 'gallery' ? (
                        // Vista Galería - Grid responsive
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredOrders.map((order) => {
                                const firstItem = order.items[0];

                                return (
                                    <Link
                                        key={order.id}
                                        href={`/orders/${order.id}`}
                                        className="block"
                                    >
                                        <div className="bg-card text-card-foreground border border-gray-300 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                                            <div className="mb-6 inline-flex items-center gap-2">
                                                <span className="text-foreground">✓</span>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground uppercase">{translateStatus(order.status)}</p>
                                                    <p className="text-xs text-muted-foreground">{order.date}</p>
                                                </div>
                                            </div>

                                            {firstItem && (
                                                <div className="flex flex-col gap-4 mb-6">
                                                    <div className="w-full aspect-square bg-muted rounded overflow-hidden">
                                                        <img src={firstItem.product.images[0]?.url} alt={firstItem.product.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-display font-bold text-lg uppercase leading-tight text-foreground">{firstItem.product.name}</h3>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-200 pt-4">
                                                <div className="flex justify-between items-center mb-1">
                                                    <p className="text-sm font-bold text-foreground">Cantidad: {order.items.reduce((acc, item) => acc + item.quantity, 0)}</p>
                                                    {order.items.reduce((acc, item) => acc + ((item.product.originalPrice || item.product.price) - item.price) * item.quantity, 0) > 0 && (
                                                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                                            Ahorraste {formatPrice(order.items.reduce((acc, item) => acc + ((item.product.originalPrice || item.product.price) - item.price) * item.quantity, 0))}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-4">Pedido #{order.id}</p>

                                                <p className="text-lg font-bold mb-6 text-foreground">{formatPrice(order.total)}</p>

                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded border-border text-[var(--color-amber-900)] hover:text-[var(--color-amber-900)]/80 hover:border-[var(--color-amber-900)] hover:bg-transparent normal-case font-bold"
                                                >
                                                    Volver a comprar
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        // Vista Lista - Table
                        <div className="bg-card rounded-md border border-gray-300 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted hover:bg-muted">
                                        <TableHead className="w-[300px] text-xs font-bold uppercase tracking-wider pl-6">Pedido</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider">Estado</TableHead>
                                        <TableHead className="text-xs font-bold uppercase tracking-wider">Fecha</TableHead>
                                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider">Total</TableHead>
                                        <TableHead className="text-center text-xs font-bold uppercase tracking-wider pr-6">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => {
                                        const firstItem = order.items[0];
                                        return (
                                            <TableRow key={order.id} className="hover:bg-muted/50 transition-colors group">
                                                <TableCell className="pl-6 font-medium">
                                                    <div className="flex items-center gap-4">
                                                        {firstItem && (
                                                            <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                                                                <img src={firstItem.product.images[0]?.url} alt={firstItem.product.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-bold text-sm text-foreground block">#{order.id}</span>
                                                            <span className="text-xs text-muted-foreground">Cantidad: {order.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-foreground">
                                                        {translateStatus(order.status)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {order.date}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-foreground">
                                                    {formatPrice(order.total)}
                                                </TableCell>
                                                <TableCell className="text-center pr-6">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 hover:text-[var(--color-amber-900)]"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                generateOrderPDF(order);
                                                            }}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            <span className="sr-only">Descargar boleta</span>
                                                        </Button>
                                                        <Link href={`/orders/${order.id}`}>
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                <Eye className="w-4 h-4" />
                                                                <span className="sr-only">Ver pedido</span>
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
