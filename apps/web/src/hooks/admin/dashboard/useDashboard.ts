import { useMemo, useState } from 'react';
import {
    calculateDashboardAnalytics,
    calculateMarketingAttributionMetrics,
    buildDashboardCategoryData,
    buildDashboardSalesTrendData,
} from '@/lib/dashboard/analytics';
import { resolveDashboardQuickRange } from '@/lib/dashboard/dateRanges';
import { useAdminDashboardData } from './useAdminDashboardData';
import { useDashboardDateRange } from './useDashboardDateRange';
import { useDashboardOrderActions } from './useDashboardOrderActions';
import { useDashboardPagination } from './useDashboardPagination';
import { useDashboardReport } from './useDashboardReport';
import { useTopProducts } from './useTopProducts';
import { DashboardFacade } from './types';
import { useShopConfigPublic } from '@/hooks/useShopConfigPublic';
import { DashboardAttributionQuickRange } from '@/lib/dashboard/types';
import { DashboardRetentionRange } from '@/types';

const ATTRIBUTION_QUICK_RANGES: DashboardAttributionQuickRange[] = ['1D', '7D', '1M'];
const RETENTION_QUICK_RANGES: DashboardRetentionRange[] = ['1D', '7D', '1M'];

export function useDashboard(): DashboardFacade {
    const data = useAdminDashboardData();
    const dateRange = useDashboardDateRange();
    const topProducts = useTopProducts();
    const shopConfig = useShopConfigPublic();
    const [selectedAttributionQuickRange, setSelectedAttributionQuickRange] = useState<DashboardAttributionQuickRange>('1M');
    const [selectedRetentionQuickRange, setSelectedRetentionQuickRange] = useState<DashboardRetentionRange>('1M');

    const setRetentionQuickRange = (range: DashboardRetentionRange) => {
        setSelectedRetentionQuickRange(range);
        void data.reloadData(range);
    };

    const attributionDateRange = useMemo(
        () => resolveDashboardQuickRange(selectedAttributionQuickRange),
        [selectedAttributionQuickRange]
    );

    const analytics = useMemo(() => {
        return calculateDashboardAnalytics(
            data.orders,
            data.products,
            dateRange.dateRange,
            data.cartFunnel,
            shopConfig.lowStockThreshold
        );
    }, [data.orders, data.products, dateRange.dateRange, data.cartFunnel, shopConfig.lowStockThreshold]);

    const salesTrendData = useMemo(() => {
        return buildDashboardSalesTrendData(data.orders, dateRange.dateRange);
    }, [data.orders, dateRange.dateRange]);

    const marketingAttribution = useMemo(() => {
        return calculateMarketingAttributionMetrics(data.orders, attributionDateRange);
    }, [data.orders, attributionDateRange]);

    const categoryData = useMemo(() => {
        return buildDashboardCategoryData(data.orders);
    }, [data.orders]);

    const pagination = useDashboardPagination(data.orders, { initialItemsPerPage: 5 });

    const orderActions = useDashboardOrderActions({
        setOrders: data.setOrders,
    });

    const report = useDashboardReport({
        analytics,
        categoryData,
        dateRange: dateRange.dateRange,
    });

    return {
        loading: data.loading,
        error: data.error,
        reloadData: data.reloadData,
        orders: data.orders,

        analytics,
        marketingAttribution,
        salesTrendData,
        categoryData,
        topProducts: topProducts.topProducts,
        topProductsLoading: topProducts.loading,
        customerRetention: data.customerRetention,

        dateRange: dateRange.dateRange,
        defaultDateRange: dateRange.defaultDateRange,
        selectedQuickRange: dateRange.selectedQuickRange,
        quickRanges: dateRange.quickRanges,
        setQuickRange: dateRange.setQuickRange,
        setDateRange: dateRange.setDateRange,

        attributionQuickRanges: ATTRIBUTION_QUICK_RANGES,
        selectedAttributionQuickRange,
        setAttributionQuickRange: setSelectedAttributionQuickRange,

        retentionQuickRanges: RETENTION_QUICK_RANGES,
        selectedRetentionQuickRange,
        setRetentionQuickRange,

        currentPage: pagination.currentPage,
        itemsPerPage: pagination.itemsPerPage,
        totalItems: pagination.totalItems,
        paginatedOrders: pagination.paginatedItems,
        setCurrentPage: pagination.setCurrentPage,
        setItemsPerPage: pagination.setItemsPerPage,

        selectedOrder: orderActions.selectedOrder,
        isModalOpen: orderActions.isModalOpen,
        pendingStatusChange: orderActions.pendingStatusChange,
        handleStatusUpdate: orderActions.handleStatusUpdate,
        handleViewOrder: orderActions.handleViewOrder,
        closeOrderModal: orderActions.closeOrderModal,
        clearPendingStatusChange: orderActions.clearPendingStatusChange,
        confirmPendingStatusChange: orderActions.confirmPendingStatusChange,

        isReportModalOpen: report.isReportModalOpen,
        reportBlob: report.reportBlob,
        isGeneratingReport: report.isGeneratingReport,
        handleGenerateReport: report.handleGenerateReport,
        closeReportModal: report.closeReportModal,
    };
}
