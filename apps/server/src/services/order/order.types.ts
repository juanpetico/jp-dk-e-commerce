export type Size = "S" | "M" | "L" | "XL" | "XXL" | "STD";

export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export interface OrderItemInput {
    productId: string;
    quantity: number;
    size: Size;
}

export interface OrderFilters {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
    search?: string;
}
