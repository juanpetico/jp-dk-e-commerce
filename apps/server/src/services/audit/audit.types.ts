import type { Prisma } from "@prisma/client";

export type AuditAction =
    | "ROLE_CHANGE"
    | "STATUS_CHANGE"
    | "PRODUCT_CREATED"
    | "PRODUCT_DELETED"
    | "PRODUCT_PRICE_CHANGE"
    | "PRODUCT_STOCK_CHANGE"
    | "PRODUCT_PUBLISHED"
    | "PRODUCT_UNPUBLISHED"
    | "ORDER_STATUS_CHANGE"
    | "CATEGORY_CREATED"
    | "CATEGORY_PUBLISHED"
    | "CATEGORY_UNPUBLISHED"
    | "CATEGORY_DELETED"
    | "STORE_CONFIG_CHANGE"
    | "COUPON_CREATED"
    | "COUPON_UPDATED"
    | "COUPON_DELETED"
    | "PRODUCT_SALE_CHANGE";

export interface AuditEntry {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue: string | null;
    newValue: string | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
    actor: {
        id: string;
        name: string | null;
        email: string;
    };
}

export interface ListLogsParams {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    actorQuery?: string;
    createdFrom?: Date;
    createdTo?: Date;
    userId?: string;
    take?: number;
    skip?: number;
}

export interface ListLogsResult {
    items: AuditEntry[];
    total: number;
}
