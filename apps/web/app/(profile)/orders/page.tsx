'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../src/store/UserContext';
import Button from '../../../src/components/ui/Button';
import { Grid3x3, Filter, List, MoreVertical } from 'lucide-react';

export default function OrdersPage() {
    const { user, isAuthenticated } = useUser();
    const router = useRouter();
    const [showFilter, setShowFilter] = useState(false);
    const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [filterTab, setFilterTab] = useState<'sort' | 'filter'>('sort');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    React.useEffect(() => {
        if (!isAuthenticated || (user === null && !isAuthenticated)) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router]);

    if (!user) {
        return null;
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Top Navigation Removed - Handled by Layout */}

            <div className="flex items-center justify-between mb-8">
                <h1 className="font-display text-3xl font-bold">Pedidos</h1>
                <div className="flex gap-2">
                    {/* Vista Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowViewDropdown(!showViewDropdown)}
                            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                            {viewMode === 'gallery' ? <Grid3x3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                            {viewMode === 'gallery' ? 'Galería' : 'Lista'}
                            <span className="text-xs">▼</span>
                        </button>

                        {showViewDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 py-1">
                                <button
                                    onClick={() => {
                                        setViewMode('gallery');
                                        setShowViewDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                    Galería
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('list');
                                        setShowViewDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                            Filtro
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay oscuro cuando el filtro está abierto */}
            {showFilter && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={() => setShowFilter(false)}
                />
            )}

            {/* Filter Modal - desliza desde la derecha */}
            <div className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${showFilter ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header con pestañas */}
                    <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 p-6">
                        <button
                            onClick={() => setFilterTab('sort')}
                            className={`px-4 py-1 rounded text-sm font-medium transition-colors ${filterTab === 'sort'
                                ? 'bg-gray-100 dark:bg-gray-700 text-red-600'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Ordenar
                        </button>
                        <button
                            onClick={() => setFilterTab('filter')}
                            className={`px-4 py-1 rounded text-sm font-medium transition-colors ${filterTab === 'filter'
                                ? 'bg-gray-100 dark:bg-gray-700 text-red-600'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Filtrar
                        </button>
                    </div>

                    {/* Contenido scrolleable */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {filterTab === 'sort' ? (
                            /* Opciones de Ordenar */
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="sort" className="accent-red-600 w-4 h-4" defaultChecked />
                                    Del más reciente al más antiguo
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="sort" className="accent-red-600 w-4 h-4" />
                                    Del más antiguo al más reciente
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="sort" className="accent-red-600 w-4 h-4" />
                                    Número de pedido (de mayor a menor)
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="sort" className="accent-red-600 w-4 h-4" />
                                    Número de pedido (de menor a mayor)
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="sort" className="accent-red-600 w-4 h-4" />
                                    Total del pedido (de mayor a menor)
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="sort" className="accent-red-600 w-4 h-4" />
                                    Total del pedido (de menor a mayor)
                                </label>
                            </div>
                        ) : (
                            /* Opciones de Filtrar */
                            <div className="space-y-4">
                                <h3 className="font-bold text-sm mb-4">Fecha del pedido</h3>

                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="dateFilter" className="accent-red-600 w-4 h-4" />
                                    Hoy
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="dateFilter" className="accent-red-600 w-4 h-4" />
                                    Últimos siete días
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="dateFilter" className="accent-red-600 w-4 h-4" />
                                    Últimos 30 días
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="dateFilter" className="accent-red-600 w-4 h-4" />
                                    Últimos 90 días
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="dateFilter" className="accent-red-600 w-4 h-4" />
                                    Últimos 12 meses
                                </label>

                                {/* Opción Personalizado */}
                                <div>
                                    <label className="flex items-center gap-3 text-sm cursor-pointer mb-3">
                                        <input
                                            type="radio"
                                            name="dateFilter"
                                            className="accent-red-600 w-4 h-4"
                                            onChange={(e) => setShowCustomDatePicker(e.target.checked)}
                                        />
                                        Personalizado
                                    </label>

                                    {showCustomDatePicker && (
                                        <div className="ml-7 space-y-3 animate-fade-in">
                                            <div>
                                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Fecha de inicio</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Fecha de finalización</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Borrar selección */}
                                <button className="text-red-600 text-sm font-medium hover:underline mt-4">
                                    Borrar selección
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer con botones */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                        <button className="text-red-600 text-sm font-medium">
                            Borrar todo
                        </button>
                        <button
                            onClick={() => setShowFilter(false)}
                            className="bg-[#FF0000] text-white px-8 py-2 rounded font-bold text-sm hover:bg-[#CC0000] transition-colors"
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 relative">                {/* Orders List */}
                <div className="flex-1">
                    {viewMode === 'gallery' ? (
                        // Vista Galería - Grid responsive
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {user.orders?.map((order) => {
                                const firstItem = order.items[0];

                                return (
                                    <Link
                                        key={order.id}
                                        href={`/orders/${order.id}`}
                                        className="block"
                                    >
                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-6 inline-flex items-center gap-2">
                                                <span className="text-black dark:text-white">✓</span>
                                                <div>
                                                    <p className="text-xs font-bold text-black dark:text-white uppercase">{order.status}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.date}</p>
                                                </div>
                                            </div>

                                            {firstItem && (
                                                <div className="flex flex-col gap-4 mb-6">
                                                    <div className="w-full aspect-square bg-black rounded overflow-hidden">
                                                        <img src={firstItem.images[0]} alt={firstItem.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-display font-bold text-lg uppercase leading-tight">{firstItem.name}</h3>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                                <p className="text-sm font-bold mb-1">{order.items.length} artículo{order.items.length !== 1 ? 's' : ''}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Pedido #{order.id}</p>

                                                <p className="text-lg font-bold mb-6">{formatPrice(order.total)}</p>

                                                <Button
                                                    variant="outline"
                                                    fullWidth
                                                    className="rounded border-gray-200 dark:border-gray-700 text-red-600 hover:text-red-700 hover:border-red-600 hover:bg-transparent normal-case font-bold"
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
                        // Vista Lista
                        user.orders?.map((order) => {
                            const firstItem = order.items[0];

                            return (
                                <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        {firstItem && (
                                            <div className="w-16 h-16 bg-black rounded flex-shrink-0">
                                                <img src={firstItem.images[0]} alt={firstItem.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm">#{order.id}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{order.items.length} artículo{order.items.length !== 1 ? 's' : ''}</p>
                                        </div>

                                        {/* Estado (Confirmado) - con bold */}
                                        <div className="min-w-[100px]">
                                            <p className="text-sm font-bold">{order.status}</p>
                                        </div>

                                        {/* Fecha */}
                                        <div className="min-w-[80px] text-gray-500 dark:text-gray-400">
                                            <p className="text-xs">{order.date}</p>
                                        </div>

                                        <div className="text-right min-w-[120px]">
                                            <p className="font-bold">{formatPrice(order.total)}</p>
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {openMenuId === order.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenuId(null)}
                                                    />
                                                    <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 py-1">
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            onClick={() => setOpenMenuId(null)}
                                                        >
                                                            Ver pedido
                                                        </Link>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
