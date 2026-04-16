import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { userInclude } from "../user.queries.js";
import { mapUserToResponse } from "../user.mappers.js";

export const getUserByIdUseCase = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: userInclude,
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return mapUserToResponse(user);
};
