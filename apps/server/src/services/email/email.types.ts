export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export interface WelcomeEmailData {
    userName: string;
    userEmail: string;
    couponCode: string;
    couponValue: number;
    couponType: "PERCENTAGE" | "FIXED_AMOUNT";
}

export interface OrderReceiptEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: Array<{
        productName: string;
        size: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    taxes: number;
    total: number;
    couponCode?: string | undefined;
    shippingStreet: string;
    shippingComuna: string;
    shippingRegion: string;
}

export interface PasswordResetEmailData {
    userName: string;
    userEmail: string;
    resetUrl: string;
}

export interface AbandonedCartEmailData {
    userName: string;
    userEmail: string;
    totalAmount: number;
    items: Array<{
        productName: string;
        productSlug: string;
        imageUrl: string | null;
        size: string;
        quantity: number;
        price: number;
    }>;
}

export interface VipRewardEmailData {
    userName: string;
    userEmail: string;
    couponCode: string;
    couponValue: number;
    couponType: "PERCENTAGE" | "FIXED_AMOUNT";
    rewardMessage: string;
}

export interface ReviewRequestEmailData {
    orderId: string;
    userName: string;
    userEmail: string;
    items: Array<{
        productName: string;
        productSlug: string;
        imageUrl: string | null;
    }>;
}
