import React from 'react';
import SonnerConfirm from '@/components/ui/SonnerConfirm';
import AdminDataLoadErrorState from '@/components/admin/shared/AdminDataLoadErrorState';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import ReportModal from '@/components/admin/shared/ReportModal';
import { AdminDashboardHeader } from './AdminDashboardHeader';
import { DashboardKpiCards } from './DashboardKpiCards';
import { DashboardSalesTrendChart } from './DashboardSalesTrendChart';
import { DashboardCategoryChart } from './DashboardCategoryChart';
import { DashboardCustomerRetentionCard } from './DashboardCustomerRetentionCard';
import { DashboardRecentOrdersTable } from './DashboardRecentOrdersTable';
import { DashboardTopProductsTable } from './DashboardTopProductsTable';
import { DashboardFacade } from '@/hooks/admin/dashboard/types';

interface AdminDashboardViewProps {
    dashboard: DashboardFacade;
    basePath: '/admin' | '/superadmin';
}

function DashboardContentSkeleton() {
    return (
        <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-lg bg-muted" />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="h-64 rounded-lg bg-muted lg:col-span-2" />
                <div className="h-64 rounded-lg bg-muted" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="h-52 rounded-lg bg-muted" />
                <div className="h-52 rounded-lg bg-muted" />
            </div>
            <div className="h-48 rounded-lg bg-muted" />
        </div>
    );
}

export function AdminDashboardView({ dashboard, basePath }: AdminDashboardViewProps) {
    return (
        <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-10">
            <SonnerConfirm
                isOpen={!!dashboard.pendingStatusChange}
                title="¿Cancelar pedido?"
                description="Esta acción cambiará el estado del pedido a Cancelado."
                onConfirm={() => {
                    void dashboard.confirmPendingStatusChange();
                }}
                onCancel={dashboard.clearPendingStatusChange}
            />

            <AdminDashboardHeader
                basePath={basePath}
                onGenerateReport={() => {
                    void dashboard.handleGenerateReport();
                }}
            />

            {dashboard.error && !dashboard.loading ? (
                <AdminDataLoadErrorState message={dashboard.error} onRetry={dashboard.reloadData} />
            ) : dashboard.loading ? (
                <DashboardContentSkeleton />
            ) : (
                <>
                    <DashboardKpiCards
                        analytics={dashboard.analytics}
                        marketingAttribution={dashboard.marketingAttribution}
                        attributionQuickRanges={dashboard.attributionQuickRanges}
                        selectedAttributionQuickRange={dashboard.selectedAttributionQuickRange}
                        onAttributionQuickRangeSelect={dashboard.setAttributionQuickRange}
                    />

                    <DashboardSalesTrendChart
                        salesTrendData={dashboard.salesTrendData}
                        quickRanges={dashboard.quickRanges}
                        selectedQuickRange={dashboard.selectedQuickRange}
                        onQuickRangeSelect={dashboard.setQuickRange}
                        dateRange={dashboard.dateRange}
                        onDateRangeChange={dashboard.setDateRange}
                        defaultDateRange={dashboard.defaultDateRange}
                    />

                    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:auto-rows-fr">
                        <DashboardCategoryChart categoryData={dashboard.categoryData} />
                        <DashboardCustomerRetentionCard
                            metrics={dashboard.customerRetention}
                            quickRanges={dashboard.retentionQuickRanges}
                            selectedQuickRange={dashboard.selectedRetentionQuickRange}
                            loading={dashboard.customerRetentionLoading}
                            onQuickRangeSelect={dashboard.setRetentionQuickRange}
                        />
                    </div>

                    <DashboardTopProductsTable
                        topProducts={dashboard.topProducts}
                        loading={dashboard.topProductsLoading}
                        basePath={basePath}
                    />

                    <DashboardRecentOrdersTable
                        basePath={basePath}
                        orders={dashboard.orders}
                        paginatedOrders={dashboard.paginatedOrders}
                        currentPage={dashboard.currentPage}
                        totalItems={dashboard.totalItems}
                        itemsPerPage={dashboard.itemsPerPage}
                        onPageChange={dashboard.setCurrentPage}
                        onItemsPerPageChange={dashboard.setItemsPerPage}
                        onViewOrder={dashboard.handleViewOrder}
                    />

                    <OrderDetailModal
                        isOpen={dashboard.isModalOpen}
                        onClose={dashboard.closeOrderModal}
                        order={dashboard.selectedOrder}
                        onStatusChange={(orderId, newStatus) => {
                            void dashboard.handleStatusUpdate(orderId, newStatus);
                        }}
                    />

                    <ReportModal
                        isOpen={dashboard.isReportModalOpen}
                        onClose={dashboard.closeReportModal}
                        pdfBlob={dashboard.reportBlob}
                        isLoading={dashboard.isGeneratingReport}
                        fileName={`reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`}
                    />
                </>
            )}
        </div>
    );
}
