import prisma from "../../../config/prisma.js";
import bcrypt from "bcrypt";
import { userInclude } from "../user.queries.js";
import { mapUserToResponse } from "../user.mappers.js";
import type { CreateUserData } from "../user.types.js";

export const createUserUseCase = async (data: CreateUserData) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            name: data.name ?? null,
            role: data.role || "CLIENT",
        },
        include: userInclude,
    });

    return mapUserToResponse(user);
};
