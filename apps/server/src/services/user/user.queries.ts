import type { UserListParams } from "./user.types.js";

export const adminUserListSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    deactivationReason: true,
    lastLogin: true,
    createdAt: true,
} as const;

export const userInclude = {
    addresses: {
        where: { isActive: true },
    },
    orders: {
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
            shippingAddress: true,
            billingAddress: true,
        },
    },
} as const;

export const buildUsersWhere = (params: UserListParams) => {
    const where: any = {};

    if (params.search) {
        where.OR = [
            { email: { contains: params.search, mode: "insensitive" } },
            { name: { contains: params.search, mode: "insensitive" } },
        ];
    }

    if (params.role && params.role !== "ALL") {
        where.role = params.role;
    }

    if (params.status && params.status !== "ALL") {
        where.isActive = params.status === "ACTIVE";
    }

    return where;
};
