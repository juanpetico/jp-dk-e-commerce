'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/UserContext';
import OrdersPageEmpty from './OrdersPage.empty';
import OrdersPageFiltersDrawer from './OrdersPage.filters-drawer';
import OrdersPageGallery from './OrdersPage.gallery';
import OrdersPageHeader from './OrdersPage.header';
import OrdersPageTable from './OrdersPage.table';
import {
    OrdersDateFilter,
    OrdersDateRange,
    OrdersFilterTab,
    OrdersSortBy,
    OrdersViewMode,
} from './OrdersPage.types';
import { getFilteredAndSortedOrders } from './OrdersPage.utils';

const VIEW_MODE_STORAGE_KEY = 'ordersViewMode';

export default function OrdersPageClient() {
    const { user, isAuthenticated } = useUser();
    const router = useRouter();

    const [showFilter, setShowFilter] = useState(false);
    const [viewMode, setViewMode] = useState<OrdersViewMode>('gallery');
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const [filterTab, setFilterTab] = useState<OrdersFilterTab>('sort');

    const [sortBy, setSortBy] = useState<OrdersSortBy>('date-desc');
    const [dateFilter, setDateFilter] = useState<OrdersDateFilter>('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState<OrdersDateRange | undefined>(undefined);

    useEffect(() => {
        const savedViewMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
        if (savedViewMode === 'gallery' || savedViewMode === 'list') {
            setViewMode(savedViewMode);
        }

        if (!isAuthenticated || (user === null && !isAuthenticated)) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    }, [viewMode]);

    const filteredOrders = useMemo(() => {
        if (!user?.orders) return [];

        return getFilteredAndSortedOrders(user.orders, {
            sortBy,
            statusFilter,
            dateFilter,
            dateRange,
        });
    }, [dateFilter, dateRange, sortBy, statusFilter, user?.orders]);

    const isFilterActive = dateFilter !== 'all' || statusFilter !== 'all';

    const resetFilters = () => {
        setSortBy('date-desc');
        setDateFilter('all');
        setStatusFilter('all');
        setDateRange(undefined);
    };

    const handleViewModeChange = (mode: OrdersViewMode) => {
        setViewMode(mode);
        setShowViewDropdown(false);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <OrdersPageHeader
                viewMode={viewMode}
                showViewDropdown={showViewDropdown}
                isFilterActive={isFilterActive}
                onViewModeChange={handleViewModeChange}
                onToggleViewDropdown={() => setShowViewDropdown((current) => !current)}
                onToggleFilter={() => setShowFilter((current) => !current)}
                onResetFilters={resetFilters}
            />

            <OrdersPageFiltersDrawer
                showFilter={showFilter}
                filterTab={filterTab}
                sortBy={sortBy}
                statusFilter={statusFilter}
                dateFilter={dateFilter}
                dateRange={dateRange}
                onClose={() => setShowFilter(false)}
                onFilterTabChange={setFilterTab}
                onSortByChange={setSortBy}
                onStatusFilterChange={setStatusFilter}
                onDateFilterChange={setDateFilter}
                onDateRangeChange={setDateRange}
                onResetFilters={resetFilters}
            />

            <div className="flex flex-col lg:flex-row gap-8 relative">
                <div className="flex-1">
                    {filteredOrders.length === 0 ? (
                        <OrdersPageEmpty isFilterActive={isFilterActive} onResetFilters={resetFilters} />
                    ) : viewMode === 'gallery' ? (
                        <OrdersPageGallery orders={filteredOrders} />
                    ) : (
                        <OrdersPageTable orders={filteredOrders} />
                    )}
                </div>
            </div>
        </div>
    );
}
