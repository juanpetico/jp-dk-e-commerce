import prisma from "../../../config/prisma.js";
import type { UserRole } from "../user.types.js";

const userInclude = {
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
};

export const getAllUsersUseCase = async (params?: { role?: string }) => {
    return prisma.user.findMany({
        where: {
            ...(params?.role && params.role !== "ALL" ? { role: params.role as UserRole } : {}),
        },
        include: userInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};
