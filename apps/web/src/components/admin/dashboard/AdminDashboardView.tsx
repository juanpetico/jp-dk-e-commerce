import React from 'react';
import { Loader2 } from 'lucide-react';
import SonnerConfirm from '@/components/ui/SonnerConfirm';
import OrderDetailModal from '@/components/admin/orders/OrderDetailModal';
import ReportModal from '@/components/admin/shared/ReportModal';
import { AdminDashboardHeader } from './AdminDashboardHeader';
import { DashboardKpiCards } from './DashboardKpiCards';
import { DashboardSalesTrendChart } from './DashboardSalesTrendChart';
import { DashboardCategoryChart } from './DashboardCategoryChart';
import { DashboardRecentOrdersTable } from './DashboardRecentOrdersTable';
import { DashboardFacade } from '@/hooks/admin/dashboard/types';

interface AdminDashboardViewProps {
    dashboard: DashboardFacade;
    basePath: '/admin' | '/superadmin';
}

export function AdminDashboardView({ dashboard, basePath }: AdminDashboardViewProps) {
    if (dashboard.loading) {
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

            <DashboardKpiCards analytics={dashboard.analytics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardSalesTrendChart
                    salesTrendData={dashboard.salesTrendData}
                    quickRanges={dashboard.quickRanges}
                    selectedQuickRange={dashboard.selectedQuickRange}
                    onQuickRangeSelect={dashboard.setQuickRange}
                    dateRange={dashboard.dateRange}
                    onDateRangeChange={dashboard.setDateRange}
                    defaultDateRange={dashboard.defaultDateRange}
                />

                <DashboardCategoryChart categoryData={dashboard.categoryData} />
            </div>

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
        </div>
    );
}
