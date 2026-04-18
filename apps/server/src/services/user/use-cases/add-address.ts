import prisma from "../../../config/prisma.js";
import type { AddressMutationData } from "../user.types.js";

export const addAddressUseCase = async (userId: string, data: AddressMutationData) => {
    const payload = { ...data };
    const count = await prisma.address.count({ where: { userId, isActive: true } });

    if (count === 0) {
        payload.isDefault = true;
    }

    if (payload.isDefault) {
        await prisma.address.updateMany({
            where: { userId, isActive: true },
            data: { isDefault: false },
        });
    }

    return prisma.address.create({
        data: {
            ...payload,
            userId,
        },
    });
};
