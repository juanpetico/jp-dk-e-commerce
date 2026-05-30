import { useMemo, useState } from 'react';
import {
    calculateDashboardAnalytics,
    calculateMarketingAttributionMetrics,
    buildDashboardCategoryData,
    buildDashboardSalesTrendData,
} from '@/lib/dashboard/analytics';
import {
    calculatePreviousPeriod,
    resolveDashboardQuickRange,
} from '@/lib/dashboard/dateRanges';
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
const RETENTION_QUICK_RANGES: DashboardRetentionRange[] = ['1D', '7D', '1M', '3M', '6M', '1Y'];

export function useDashboard(): DashboardFacade {
    const data = useAdminDashboardData();
    const kpiDateRange = useDashboardDateRange();
    const chartDateRange = useDashboardDateRange();
    const topProducts = useTopProducts();
    const shopConfig = useShopConfigPublic();
    const [selectedAttributionQuickRange, setSelectedAttributionQuickRange] = useState<DashboardAttributionQuickRange>('1M');
    const [selectedRetentionQuickRange, setSelectedRetentionQuickRange] = useState<DashboardRetentionRange>('1M');

    const setRetentionQuickRange = (range: DashboardRetentionRange) => {
        setSelectedRetentionQuickRange(range);
        void data.reloadCustomerRetention(range);
    };

    const attributionDateRange = useMemo(
        () => resolveDashboardQuickRange(selectedAttributionQuickRange),
        [selectedAttributionQuickRange]
    );

    const analytics = useMemo(() => {
        return calculateDashboardAnalytics(
            data.orders,
            data.products,
            kpiDateRange.dateRange,
            data.cartFunnel,
            shopConfig.lowStockThreshold
        );
    }, [data.orders, data.products, kpiDateRange.dateRange, data.cartFunnel, shopConfig.lowStockThreshold]);

    const previousDateRange = useMemo(() => {
        if (!kpiDateRange.dateRange?.from) return undefined;
        return calculatePreviousPeriod(kpiDateRange.dateRange);
    }, [kpiDateRange.dateRange]);

    const previousAnalytics = useMemo(() => {
        return calculateDashboardAnalytics(
            data.orders,
            data.products,
            previousDateRange,
            data.cartFunnel,
            shopConfig.lowStockThreshold
        );
    }, [data.orders, data.products, previousDateRange, data.cartFunnel, shopConfig.lowStockThreshold]);

    const salesTrendData = useMemo(() => {
        return buildDashboardSalesTrendData(data.orders, chartDateRange.dateRange);
    }, [data.orders, chartDateRange.dateRange]);

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
        topProducts: topProducts.topProducts,
        dateRange: kpiDateRange.dateRange,
    });

    return {
        loading: data.loading,
        error: data.error,
        reloadData: data.reloadData,
        orders: data.orders,

        analytics,
        previousAnalytics,
        previousDateRange,
        marketingAttribution,
        salesTrendData,
        categoryData,
        topProducts: topProducts.topProducts,
        topProductsLoading: topProducts.loading,
        topProductsRange: topProducts.selectedRange,
        topProductsAvailableRanges: topProducts.availableRanges,
        setTopProductsRange: topProducts.setSelectedRange,
        customerRetention: data.customerRetention,
        customerRetentionLoading: data.loadingCustomerRetention,

        kpiDateRange: kpiDateRange.dateRange,
        kpiDefaultDateRange: kpiDateRange.defaultDateRange,
        kpiSelectedQuickRange: kpiDateRange.selectedQuickRange,
        kpiQuickRanges: kpiDateRange.quickRanges,
        setKpiQuickRange: kpiDateRange.setQuickRange,
        setKpiDateRange: kpiDateRange.setDateRange,

        dateRange: chartDateRange.dateRange,
        defaultDateRange: chartDateRange.defaultDateRange,
        selectedQuickRange: chartDateRange.selectedQuickRange,
        quickRanges: chartDateRange.quickRanges,
        setQuickRange: chartDateRange.setQuickRange,
        setDateRange: chartDateRange.setDateRange,

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
