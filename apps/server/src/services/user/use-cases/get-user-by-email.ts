import prisma from "../../../config/prisma.js";
import { userInclude } from "../user.queries.js";
import { mapUserToResponse } from "../user.mappers.js";

export const getUserByEmailUseCase = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: userInclude,
    });

    if (!user) return null;
    return mapUserToResponse(user);
};
