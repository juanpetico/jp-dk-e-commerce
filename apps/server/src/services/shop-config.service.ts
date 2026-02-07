import prisma from "../config/prisma.js";

export const shopConfigService = {
    /**
     * Obtener la configuración actual de la tienda.
     * Si no existe, crea una por defecto.
     */
    async getConfig() {
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
    },

    /**
     * Actualizar la configuración de la tienda.
     */
    async updateConfig(data: {
        welcomeCouponCode?: string;
        vipThreshold?: number;
        vipCouponCode?: string;
        vipRewardMessage?: string;
    }) {
        return await prisma.storeConfig.update({
            where: { id: "default" },
            data,
        });
    },
};
