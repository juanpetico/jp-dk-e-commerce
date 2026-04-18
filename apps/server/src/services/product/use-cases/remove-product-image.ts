import prisma from "../../../config/prisma.js";

export const removeProductImageUseCase = async (imageId: string) => {
    await prisma.productImage.delete({
        where: { id: imageId },
    });
};
