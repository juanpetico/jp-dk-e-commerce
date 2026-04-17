import { Order } from '@/types';

export type OrdersViewMode = 'gallery' | 'list';
export type OrdersFilterTab = 'sort' | 'filter';
export type OrdersSortBy = 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc';
export type OrdersDateFilter = 'all' | 'today' | '7days' | '30days' | '90days' | '12months' | 'custom';

export interface OrdersDateRange {
    from: Date | undefined;
    to?: Date | undefined;
}

export interface OrdersPageHeaderProps {
    viewMode: OrdersViewMode;
    showViewDropdown: boolean;
    isFilterActive: boolean;
    onViewModeChange: (mode: OrdersViewMode) => void;
    onToggleViewDropdown: () => void;
    onToggleFilter: () => void;
    onResetFilters: () => void;
}

export interface OrdersPageFiltersDrawerProps {
    showFilter: boolean;
    filterTab: OrdersFilterTab;
    sortBy: OrdersSortBy;
    statusFilter: string;
    dateFilter: OrdersDateFilter;
    dateRange?: OrdersDateRange;
    onClose: () => void;
    onFilterTabChange: (tab: OrdersFilterTab) => void;
    onSortByChange: (value: OrdersSortBy) => void;
    onStatusFilterChange: (value: string) => void;
    onDateFilterChange: (value: OrdersDateFilter) => void;
    onDateRangeChange: (value: OrdersDateRange | undefined) => void;
    onResetFilters: () => void;
}

export interface OrdersPageEmptyProps {
    isFilterActive: boolean;
    onResetFilters: () => void;
}

export interface OrdersPageGalleryProps {
    orders: Order[];
}

export interface OrdersPageTableProps {
    orders: Order[];
}
