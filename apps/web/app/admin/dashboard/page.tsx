'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import SonnerConfirm from '@/components/ui/SonnerConfirm';
import { Product, Order, OrderStatus } from '@/types';
import { fetchProducts } from '@/services/productService';
import { fetchAllOrders, updateOrderStatus, ORDER_STATUS_LABELS, getOrderStatusColor } from '@/services/orderService';
import OrderDetailModal from '@/components/admin/OrderDetailModal';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { generateDashboardReport } from '@/services/reportService';
import ReportModal from '@/components/admin/ReportModal';
import { cn, formatPrice } from '@/lib/utils';
import TablePagination from '@/components/admin/TablePagination';
import { DatePickerWithRange } from '@/components/ui/DateRangePicker';
import { addDays, subDays, subMonths, startOfYear, subYears, startOfDay, endOfDay, eachDayOfInterval, isSameDay } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
    DollarSign,
    TrendingUp,
    Truck,
    ShoppingBag,
    AlertTriangle,
    Plus,
    Eye,
    Loader2
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // --- UI INTERACTION STATE ---
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string, status: OrderStatus } | null>(null);
    const defaultDateRange = useMemo(() => ({
        from: subDays(new Date(), 6),
        to: new Date(),
    }), []);

    const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);
    const [selectedQuickRange, setSelectedQuickRange] = useState<string | null>(null);

    // --- REPORT STATE ---
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportBlob, setReportBlob] = useState<Blob | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const setQuickRange = (range: '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | 'ALL') => {
        if (selectedQuickRange === range) {
            setDateRange(defaultDateRange);
            setSelectedQuickRange(null);
            return;
        }

        const today = new Date();
        const to = endOfDay(today);
        let from: Date | undefined;

        switch (range) {
            case '1D':
                from = startOfDay(subDays(today, 1));
                break;
            case '5D':
                from = startOfDay(subDays(today, 5));
                break;
            case '1M':
                from = startOfDay(subMonths(today, 1));
                break;
            case '6M':
                from = startOfDay(subMonths(today, 6));
                break;
            case 'YTD':
                from = startOfYear(today);
                break;
            case '1Y':
                from = startOfDay(subYears(today, 1));
                break;
            case 'ALL':
                from = startOfDay(subYears(today, 5));
                break;
        }

        setSelectedQuickRange(range);
        setDateRange({ from, to });
    };

    // --- DATA FETCHING ---
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [productsData, ordersData] = await Promise.all([
                    fetchProducts(),
                    fetchAllOrders()
                ]);
                setProducts(productsData);
                setOrders(ordersData || []);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                toast.error('Error al cargar datos del dashboard');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    // --- ANALYTICS CALCULATIONS ---
    const analytics = useMemo(() => {
        // Total Sales (exclude Cancelled)
        const totalSales = orders
            .filter(o => o.status !== 'CANCELLED')
            .reduce((acc, curr) => acc + curr.total, 0);

        // Active Orders (Confirmed or Shipped)
        const activeOrders = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'SHIPPED').length;

        // Average Order Value
        const validOrdersCount = orders.filter(o => o.status !== 'CANCELLED').length;
        const aov = validOrdersCount > 0 ? totalSales / validOrdersCount : 0;

        // Low Stock (using real product data)
        const lowStockCount = products.filter(p => {
            const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
            return totalStock < 5;
        }).length;

        // Sales trend (mock logic adapted to dynamic totals for now, strictly should group by date)
        // Group orders by day of week for the current week? Simplified to last 7 days from data.
        // For simplicity in this iteration, we keep the trend visualization but could make it dynamic later.

        return { totalSales, activeOrders, aov, lowStockCount };
    }, [orders, products]);

    // --- CHART DATA PREPARATION ---
    // --- CHART DATA PREPARATION ---
    const salesTrendData = useMemo(() => {
        if (!dateRange?.from) return [];

        const start = startOfDay(dateRange.from);
        const end = endOfDay(dateRange.to || dateRange.from);

        // Generate all days in the interval safely
        const dateArray = eachDayOfInterval({ start, end });
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

        return dateArray.map(date => {
            const dayName = days[date.getDay()];
            // Use ISO string only for visual label if needed, or simple local formatting
            const dateStr = date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });

            // Sum sales for this day using isSameDay for robust local comparison
            const dailySales = orders
                .filter(o => o.status !== 'CANCELLED' && isSameDay(new Date(o.createdAt), date))
                .reduce((acc, curr) => acc + curr.total, 0);

            return {
                day: dateArray.length > 7 ? dateStr : dayName,
                fullDate: dateStr, // keep for potential tooltip usage
                ventas: dailySales
            };
        });
    }, [orders, dateRange]);

    const categoryData = useMemo(() => {
        const catMap = new Map<string, number>();

        if (!orders || orders.length === 0) {
            return [];
        }

        orders.forEach(order => {
            // Only count non-cancelled orders for category sales statistics
            if (order.status === 'CANCELLED') return;

            const items = order.items || [];
            if (items.length === 0) {
                console.warn(`Order ${order.id} has no items`);
                return;
            }

            items.forEach(item => {
                // Determine category name with deep fallbacks for debugging
                const product = item.product;
                let catName = 'Sin Categoría';

                if (product) {
                    // Try to find name in nested category object, fallback to ID if needed
                    if (product.category && typeof product.category === 'object' && product.category.name) {
                        catName = product.category.name;
                    } else if (product.category && typeof product.category === 'object' && (product.category as any).id) {
                        catName = `ID: ${(product.category as any).id}`;
                    } else if (product.categoryId) {
                        catName = `ID: ${product.categoryId}`;
                    } else {
                        // Check if category is just a string
                        if (typeof (product as any).category === 'string') {
                            catName = (product as any).category;
                        } else {
                            catName = 'Sin Categoría';
                        }
                    }
                } else {
                    catName = 'Item sin Producto';
                }

                const quantity = item.quantity || 0;

                if (quantity > 0) {
                    catMap.set(catName, (catMap.get(catName) || 0) + quantity);
                }
            });
        });

        const data = Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));

        // Sorting helps visualization
        const sortedData = data.sort((a, b) => b.value - a.value);

        return sortedData;
    }, [orders]);

    const COLORS = [
        '#16a34a', // Green-600 (Ventas Totales)
        '#2563eb', // Blue-600 (Órdenes Activas)
        '#9333ea', // Purple-600 (Ticket Promedio)
        '#78350f', // Amber-900 (Alerta Stock)
        '#6366f1', // Indigo fallback
        '#ec4899', // Pink fallback
    ];

    // --- HANDLERS ---
    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

            // Update selected order if modal is open
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(updatedOrder);
            }

            toast.success(`Orden actualizada a ${ORDER_STATUS_LABELS[newStatus]}`);
        } catch (error) {
            console.error('Error in status update:', error);
            toast.error('No se pudo actualizar el estado');
        }
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleGenerateReport = async () => {
        setIsReportModalOpen(true);
        setIsGeneratingReport(true);
        try {
            // Include dynamic data
            const reportData = {
                analytics,
                categoryData,
                dateRange: { from: dateRange?.from, to: dateRange?.to }
            };
            const blob = await generateDashboardReport(reportData);
            setReportBlob(blob);
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error al generar el reporte');
            setIsReportModalOpen(false);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // --- PAGINATION HELPERS ---
    const totalItems = orders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = useMemo(() => {
        return orders.slice(startIndex, startIndex + itemsPerPage);
    }, [orders, startIndex, itemsPerPage]);

    // Reset to first page when itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    // Suppress Recharts defaultProps warning
    useEffect(() => {
        const originalConsoleError = console.error;
        console.error = (...args: any[]) => {
            if (typeof args[0] === 'string' && /defaultProps/.test(args[0])) return;
            originalConsoleError(...args);
        };
        return () => {
            // Restore original console.error only if it hasn't been modified by another component
            if (console.error !== originalConsoleError) {
                // If needed, we could restore it, but in dev mode it's often safer to just leave it patched for the session
                // or restore consistently. Let's restore it.
                console.error = originalConsoleError;
            } else {
                console.error = originalConsoleError;
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground animate-pulse">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-10">
            <SonnerConfirm
                isOpen={!!pendingStatusChange}
                title="¿Cancelar pedido?"
                description="Esta acción cambiará el estado del pedido a Cancelado."
                onConfirm={() => {
                    if (pendingStatusChange) {
                        handleStatusUpdate(pendingStatusChange.id, pendingStatusChange.status);
                        setPendingStatusChange(null);
                    }
                }}
                onCancel={() => setPendingStatusChange(null)}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">Resumen financiero y logístico en tiempo real.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="text-xs h-10 px-4 border-gray-400 dark:border-border"
                        onClick={handleGenerateReport}
                    >
                        Ver Reporte
                    </Button>
                    <Link href="/admin/products?action=new">
                        <Button className="text-xs h-10 px-4 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Producto
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 1. KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sales */}
                <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 w-full">
                        <div>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Ventas Totales</p>
                            <h3 className="font-display text-2xl font-bold mt-1 text-foreground">{formatPrice(analytics.totalSales)}</h3>
                        </div>
                        <span className="bg-green-600 p-2 rounded-lg text-white shadow-md shadow-green-600/20">
                            <DollarSign className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-bold z-10 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Actualizado
                    </div>
                </div>

                {/* Active Orders */}
                <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Órdenes Activas</p>
                            <h3 className="font-display text-2xl font-bold mt-1 text-foreground">{analytics.activeOrders}</h3>
                        </div>
                        <span className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-600/20">
                            <Truck className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Confirmadas o Enviadas</div>
                </div>

                {/* AOV */}
                <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Ticket Promedio</p>
                            <h3 className="font-display text-2xl font-bold mt-1 text-foreground">{formatPrice(analytics.aov)}</h3>
                        </div>
                        <span className="bg-purple-600 p-2 rounded-lg text-white shadow-md shadow-purple-600/20">
                            <ShoppingBag className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">Por orden válida</div>
                </div>

                {/* Inventory Alert */}
                <div className="bg-card dark:bg-card border border-amber-900 dark:border-amber-900/30 p-6 rounded-xl shadow-sm flex flex-col justify-between h-32 relative">
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <p className="text-amber-900 dark:text-amber-500 text-xs font-bold uppercase tracking-wider">Alerta Stock</p>
                            <h3 className="font-display text-2xl font-bold mt-1 text-amber-900 dark:text-amber-400">{analytics.lowStockCount}</h3>
                        </div>
                        <span className="bg-amber-900 p-2 rounded-lg text-white shadow-md shadow-amber-900/20">
                            <AlertTriangle className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-600 font-medium">Productos con stock crítico (&lt; 5)</div>
                </div>
            </div>

            {/* 2. CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart */}
                <div className="lg:col-span-2 bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm flex flex-col h-96">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-wide text-foreground mb-2 sm:mb-0">Tendencia de Ingresos</h3>
                            <div className="flex gap-1 mt-1">
                                {(['1D', '5D', '1M', '6M', 'YTD', '1Y', 'ALL'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setQuickRange(range)}
                                        className={cn(
                                            "text-[10px] font-bold px-2 py-1 rounded-md transition-colors",
                                            selectedQuickRange === range
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <DatePickerWithRange
                            date={dateRange}
                            setDate={(newRange) => {
                                setDateRange(newRange);
                                setSelectedQuickRange(null); // Clear quick selection on manual change
                            }}
                            defaultDate={defaultDateRange}
                        />
                    </div>
                    <div className="w-full h-full min-h-[250px] [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_*:focus]:!outline-none">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrendData} style={{ outline: 'none' }} tabIndex={-1}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                    minTickGap={30}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value: any) => `$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value: any) => [formatPrice(Number(value)), 'Ventas']}
                                />
                                <Area type="monotone" dataKey="ventas" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card dark:bg-card border border-gray-300 dark:border-border p-6 rounded-xl shadow-sm h-[480px]">
                    <h3 className="font-bold text-sm uppercase tracking-wide mb-4 text-foreground">
                        Ventas por Categoría ({categoryData.reduce((acc, curr) => acc + curr.value, 0)} uds)
                    </h3>
                    <div className="w-full h-[380px] relative [&_.recharts-wrapper]:!outline-none [&_.recharts-surface]:!outline-none [&_*:focus]:!outline-none">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart style={{ outline: 'none' }} tabIndex={-1}>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="hsl(var(--card))"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any, name: any, props: any) => {
                                            const total = categoryData.reduce((acc, curr) => acc + curr.value, 0);
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return [`${value} unidades (${percentage}%)`, name];
                                        }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', zIndex: 1000 }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        wrapperStyle={{ zIndex: 1000 }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        layout="horizontal"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                No hay datos mdisponibles
                            </div>
                        )}
                        {/* Center Label */}
                        {categoryData.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8 h-full">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total</p>
                                    <p className="text-xl font-display font-black text-foreground">
                                        {categoryData.reduce((acc, curr) => acc + curr.value, 0)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. OPERATIONAL SUMMARY (Recent Orders) */}
            <div className="bg-card dark:bg-card rounded-xl border border-gray-300 dark:border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-300 dark:border-border flex justify-between items-center">
                    <h3 className="font-bold text-sm uppercase tracking-wide text-foreground">Pedidos Recientes</h3>
                    <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground underline">
                        Ver todos
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 dark:bg-muted/20">
                            <tr>
                                <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ID Orden</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border dark:divide-border/50">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-xs text-foreground">#{order.id.slice(0, 8)}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-foreground">{order.user?.name || 'Invitado'}</div>
                                        <div className="text-[10px] text-muted-foreground">{order.items.length} items</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-foreground">{formatPrice(order.total)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-sm border shadow-sm ${getOrderStatusColor(order.status)}`}>
                                            {ORDER_STATUS_LABELS[order.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleViewOrder(order)}
                                            className="inline-flex items-center gap-2 bg-background border border-border px-2.5 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-muted transition-all text-foreground shadow-sm"
                                        >
                                            Ver <Eye className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                                        No hay pedidos recientes
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <TablePagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            {/* Shared Modal Component */}
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                onStatusChange={handleStatusUpdate}
            />

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                pdfBlob={reportBlob}
                isLoading={isGeneratingReport}
                fileName={`reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`}
            />
        </div >
    );
};

export default AdminDashboardPage;
