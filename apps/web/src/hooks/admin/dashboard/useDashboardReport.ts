import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { CategorySalesPoint, DashboardAnalytics, DashboardDateRange } from '@/lib/dashboard/types';
import { generateDashboardReport } from '@/services/reportService';

interface UseDashboardReportParams {
    analytics: DashboardAnalytics;
    categoryData: CategorySalesPoint[];
    dateRange: DashboardDateRange | undefined;
}

export function useDashboardReport({
    analytics,
    categoryData,
    dateRange,
}: UseDashboardReportParams) {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportBlob, setReportBlob] = useState<Blob | null>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const handleGenerateReport = useCallback(async () => {
        setIsReportModalOpen(true);
        setIsGeneratingReport(true);

        try {
            const reportData = {
                analytics,
                categoryData,
                dateRange: { from: dateRange?.from, to: dateRange?.to },
            };

            const blob = await generateDashboardReport(reportData);
            setReportBlob(blob);
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error al generar el reporte');
            setIsReportModalOpen(false);
        } finally {
            setIsGeneratingReport(false);
        }
    }, [analytics, categoryData, dateRange]);

    const closeReportModal = useCallback(() => {
        setIsReportModalOpen(false);
    }, []);

    return {
        isReportModalOpen,
        reportBlob,
        isGeneratingReport,
        handleGenerateReport,
        closeReportModal,
    };
}
