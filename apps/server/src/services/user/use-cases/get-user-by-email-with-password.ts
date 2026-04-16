import prisma from "../../../config/prisma.js";
import { userInclude } from "../user.queries.js";

export const getUserByEmailWithPasswordUseCase = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: userInclude,
    });

    if (!user) return null;
    return user;
};
