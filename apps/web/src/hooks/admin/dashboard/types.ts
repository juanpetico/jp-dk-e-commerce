import { Order, TopProduct } from '@/types';
import { DashboardCustomerRetention, DashboardRetentionRange } from '@/types';
import {
    CategorySalesPoint,
    DashboardAnalytics,
    DashboardAttributionQuickRange,
    DashboardDateRange,
    MarketingAttributionMetrics,
    DashboardQuickRange,
    SalesTrendPoint,
} from '@/lib/dashboard/types';
import { DashboardTopProductsRange } from '@/lib/dashboard/dateRanges';

export interface DashboardFacade {
    loading: boolean;
    error: string | null;
    reloadData: (retentionRange?: DashboardRetentionRange) => Promise<void>;

    orders: Order[];

    analytics: DashboardAnalytics;
    previousAnalytics: DashboardAnalytics;
    previousDateRange: DashboardDateRange | undefined;
    marketingAttribution: MarketingAttributionMetrics;
    salesTrendData: SalesTrendPoint[];
    categoryData: CategorySalesPoint[];
    topProducts: TopProduct[];
    topProductsLoading: boolean;
    topProductsRange: DashboardTopProductsRange;
    topProductsAvailableRanges: DashboardTopProductsRange[];
    setTopProductsRange: (range: DashboardTopProductsRange) => void;
    customerRetention: DashboardCustomerRetention | null;
    customerRetentionLoading: boolean;

    kpiDateRange: DashboardDateRange | undefined;
    kpiDefaultDateRange: DashboardDateRange;
    kpiSelectedQuickRange: DashboardQuickRange | null;
    kpiQuickRanges: DashboardQuickRange[];
    setKpiQuickRange: (range: DashboardQuickRange) => void;
    setKpiDateRange: (range: DashboardDateRange | undefined) => void;

    dateRange: DashboardDateRange | undefined;
    defaultDateRange: DashboardDateRange;
    selectedQuickRange: DashboardQuickRange | null;
    quickRanges: DashboardQuickRange[];
    setQuickRange: (range: DashboardQuickRange) => void;
    setDateRange: (range: DashboardDateRange | undefined) => void;

    attributionQuickRanges: DashboardAttributionQuickRange[];
    selectedAttributionQuickRange: DashboardAttributionQuickRange;
    setAttributionQuickRange: (range: DashboardAttributionQuickRange) => void;

    retentionQuickRanges: DashboardRetentionRange[];
    selectedRetentionQuickRange: DashboardRetentionRange;
    setRetentionQuickRange: (range: DashboardRetentionRange) => void;

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
