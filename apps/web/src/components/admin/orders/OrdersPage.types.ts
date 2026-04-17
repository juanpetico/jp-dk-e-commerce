import { OrderStatus } from '@/types';

export type OrderFiltersState = {
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
};
