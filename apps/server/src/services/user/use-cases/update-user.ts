import prisma from "../../../config/prisma.js";
import bcrypt from "bcrypt";
import { userInclude } from "../user.queries.js";
import { mapUserToResponse } from "../user.mappers.js";
import type { UpdateUserData } from "../user.types.js";

export const updateUserUseCase = async (id: string, data: UpdateUserData) => {
    const updateData = { ...data };
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include: userInclude,
    });

    return mapUserToResponse(user);
};
