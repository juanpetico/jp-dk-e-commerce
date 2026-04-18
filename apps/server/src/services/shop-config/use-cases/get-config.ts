import prisma from "../../../config/prisma.js";

export const getConfigUseCase = async () => {
    let config = await prisma.storeConfig.findUnique({
        where: { id: "default" },
    });

    if (!config) {
        config = await prisma.storeConfig.create({
            data: {
                id: "default",
            },
        });
    }

    return config;
};
