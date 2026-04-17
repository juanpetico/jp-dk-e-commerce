export interface AbandonedCartDto {
    cartId: string;
    userId: string;
    userName: string | null;
    userEmail: string;
    updatedAt: Date;
    itemCount: number;
    totalAmount: number;
    items: Array<{
        productId: string;
        productName: string;
        productSlug: string;
        imageUrl: string | null;
        size: string;
        quantity: number;
        price: number;
    }>;
}

export interface VipCandidateDto {
    userId: string;
    userName: string | null;
    userEmail: string;
    lifetimeSpend: number;
    orderCount: number;
    vipThreshold: number;
    vipCouponCode: string;
    vipCouponValue: number;
    vipCouponType: "PERCENTAGE" | "FIXED_AMOUNT";
}

export interface ReviewRequestDto {
    orderId: string;
    userId: string;
    userName: string | null;
    userEmail: string;
    deliveredAt: Date;
    items: Array<{
        productId: string;
        productName: string;
        productSlug: string;
        imageUrl: string | null;
    }>;
}
