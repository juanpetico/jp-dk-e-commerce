import prisma from "../../../config/prisma.js";
import { AppError } from "../../../middleware/error-handler.js";
import { couponService } from "../../coupon.service.js";
import { shopConfigService } from "../../shop-config.service.js";
import { sendVipRewardEmail } from "../../email/use-cases/send-vip-reward.js";

export const grantVipAccessUseCase = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, isActive: true },
    });

    if (!user) throw new AppError("User not found", 404);
    if (!user.isActive) throw new AppError("User is not active", 400);

    const config = await shopConfigService.getConfig();

    const assignment = await couponService.assignCouponToUser(userId, config.vipCouponCode);
    if (!assignment) throw new AppError(`Cupón VIP '${config.vipCouponCode}' no existe`, 404);

    // Idempotente: si ya tenía el cupón, no volvemos a enviar el email.
    if (!assignment.isNew) {
        return { granted: false, reason: "already-assigned", user };
    }

    await sendVipRewardEmail({
        userName: user.name ?? "Cliente",
        userEmail: user.email,
        couponCode: config.vipCouponCode,
        couponValue: config.vipCouponValue,
        couponType: config.vipCouponType,
        rewardMessage: config.vipRewardMessage,
    });

    return { granted: true, user };
};
