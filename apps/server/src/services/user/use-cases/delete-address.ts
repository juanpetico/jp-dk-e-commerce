import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";

export const deleteAddressUseCase = async (userId: string, addressId: string) => {
    const existingAddress = await prisma.address.findUnique({
        where: { id: addressId },
    });

    if (!existingAddress) {
        throw new AppError("Address not found", 404);
    }

    if (existingAddress.userId !== userId) {
        throw new AppError("Unauthorized access to this address", 403);
    }

    if (existingAddress.isDefault) {
        const anotherAddress = await prisma.address.findFirst({
            where: {
                userId,
                isActive: true,
                id: { not: addressId },
            },
        });

        if (anotherAddress) {
            await prisma.address.update({
                where: { id: anotherAddress.id },
                data: { isDefault: true },
            });
        }
    }

    await prisma.address.update({
        where: { id: addressId },
        data: {
            isActive: false,
            isDefault: false,
        },
    });
};
