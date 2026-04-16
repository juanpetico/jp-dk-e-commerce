import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import type { AddressMutationData } from "../user.types.js";

export const updateAddressUseCase = async (userId: string, addressId: string, data: AddressMutationData) => {
    const existingAddress = await prisma.address.findUnique({
        where: { id: addressId },
    });

    if (!existingAddress) {
        throw new AppError("Address not found", 404);
    }

    if (existingAddress.userId !== userId) {
        throw new AppError("Unauthorized access to this address", 403);
    }

    if (data.isDefault) {
        await prisma.address.updateMany({
            where: {
                userId,
                id: { not: addressId },
                isActive: true,
            },
            data: { isDefault: false },
        });
    }

    return prisma.address.update({
        where: { id: addressId },
        data,
    });
};
