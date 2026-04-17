import { Order } from '@/types';

export interface SnapshotAddress {
    name: string;
    rut: string;
    street?: string;
    comuna?: string;
    region?: string;
    zipCode?: string;
    phone?: string;
    company?: string | null;
    country: string;
}

export interface OrderDetailsHeaderProps {
    order: Order;
    onBackToHome: () => void;
    onExportPdf: () => void;
}

export interface OrderDetailsContactCardProps {
    shipping: SnapshotAddress;
    billing: SnapshotAddress;
    email?: string | null;
    shippingMethod?: string;
}

export interface OrderDetailsSummaryCardProps {
    order: Order;
}
