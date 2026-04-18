import prisma from "../../../config/prisma.js";

export const deleteUserUseCase = async (id: string) => {
    await prisma.user.delete({
        where: { id },
    });
};
