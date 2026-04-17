import type { OrderFilters } from "./order.types.js";

export const orderWithRelationsInclude = {
    items: {
        include: {
            product: {
                include: {
                    images: true,
                    category: true,
                    variants: true,
                },
            },
        },
    },
    user: {
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
        },
    },
    coupon: {
        select: {
            id: true,
            code: true,
            type: true,
            value: true,
        },
    },
} as const;

export const orderWithAddressesInclude = {
    ...orderWithRelationsInclude,
    shippingAddress: true,
    billingAddress: true,
} as const;

export const buildOrderWhere = (filters?: OrderFilters) => {
    const where: any = {};

    if (filters?.status) {
        where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
            where.createdAt.gte = filters.startDate;
        }
        if (filters.endDate) {
            where.createdAt.lte = filters.endDate;
        }
    }

    if (filters?.search) {
        where.OR = [
            {
                id: {
                    startsWith: filters.search,
                    mode: "insensitive",
                },
            },
            {
                user: {
                    OR: [
                        {
                            name: {
                                startsWith: filters.search,
                                mode: "insensitive",
                            },
                        },
                        {
                            name: {
                                contains: ` ${filters.search}`,
                                mode: "insensitive",
                            },
                        },
                        {
                            email: {
                                startsWith: filters.search,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            },
        ];
    }

    return where;
};
