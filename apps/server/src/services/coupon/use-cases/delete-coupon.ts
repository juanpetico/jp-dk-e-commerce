import prisma from "../../../config/prisma.js";
import { createLog } from "../../audit.service.js";

export const deleteCouponUseCase = async (id: string, actorId: string) => {
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    const result = await prisma.coupon.delete({
        where: { id },
    });

    if (coupon) {
        await createLog({
            actorId,
            action: "COUPON_DELETED",
            entityType: "COUPON",
            entityId: id,
            oldValue: coupon.code,
            metadata: { description: coupon.description },
        });
    }

    return result;
};
