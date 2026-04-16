import { useMemo } from 'react';
import {
    calculateDashboardAnalytics,
    buildDashboardCategoryData,
    buildDashboardSalesTrendData,
} from '@/lib/dashboard/analytics';
import { useAdminDashboardData } from './useAdminDashboardData';
import { useDashboardDateRange } from './useDashboardDateRange';
import { useDashboardOrderActions } from './useDashboardOrderActions';
import { useDashboardPagination } from './useDashboardPagination';
import { useDashboardReport } from './useDashboardReport';
import { DashboardFacade } from './types';

export function useDashboard(): DashboardFacade {
    const data = useAdminDashboardData();
    const dateRange = useDashboardDateRange();

    const analytics = useMemo(() => {
        return calculateDashboardAnalytics(data.orders, data.products);
    }, [data.orders, data.products]);

    const salesTrendData = useMemo(() => {
        return buildDashboardSalesTrendData(data.orders, dateRange.dateRange);
    }, [data.orders, dateRange.dateRange]);

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
        orders: data.orders,

        analytics,
        salesTrendData,
        categoryData,

        dateRange: dateRange.dateRange,
        defaultDateRange: dateRange.defaultDateRange,
        selectedQuickRange: dateRange.selectedQuickRange,
        quickRanges: dateRange.quickRanges,
        setQuickRange: dateRange.setQuickRange,
        setDateRange: dateRange.setDateRange,

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
