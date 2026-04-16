export interface CouponMutationData {
    code?: string;
    description?: string;
    type?: "PERCENTAGE" | "FIXED_AMOUNT";
    value?: number;
    isActive?: boolean;
    isPublic?: boolean;
    minAmount?: number;
    maxUses?: number | null;
    maxUsesPerUser?: number;
    startDate?: string | Date;
    endDate?: string | Date | null;
}

export interface CreateCouponData {
    code: string;
    description: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    isActive: boolean;
    isPublic: boolean;
    minAmount: number;
    maxUses: number | null;
    maxUsesPerUser: number;
    startDate?: string | Date;
    endDate?: string | Date | null;
}
