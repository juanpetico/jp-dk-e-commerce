import { Order } from '@/types';
import {
    CategorySalesPoint,
    DashboardAnalytics,
    DashboardDateRange,
    DashboardQuickRange,
    SalesTrendPoint,
} from '@/lib/dashboard/types';

export interface DashboardFacade {
    loading: boolean;

    orders: Order[];

    analytics: DashboardAnalytics;
    salesTrendData: SalesTrendPoint[];
    categoryData: CategorySalesPoint[];

    dateRange: DashboardDateRange | undefined;
    defaultDateRange: DashboardDateRange;
    selectedQuickRange: DashboardQuickRange | null;
    quickRanges: DashboardQuickRange[];
    setQuickRange: (range: DashboardQuickRange) => void;
    setDateRange: (range: DashboardDateRange | undefined) => void;

    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    paginatedOrders: Order[];
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;

    selectedOrder: Order | null;
    isModalOpen: boolean;
    pendingStatusChange: { id: string; status: Order['status'] } | null;
    handleStatusUpdate: (orderId: string, newStatus: Order['status']) => Promise<void>;
    handleViewOrder: (order: Order) => void;
    closeOrderModal: () => void;
    clearPendingStatusChange: () => void;
    confirmPendingStatusChange: () => Promise<void>;

    isReportModalOpen: boolean;
    reportBlob: Blob | null;
    isGeneratingReport: boolean;
    handleGenerateReport: () => Promise<void>;
    closeReportModal: () => void;
}
