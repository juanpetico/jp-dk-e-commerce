import prisma from "../../../config/prisma.js";
import { shopConfigService } from "../../shop-config.service.js";
import type { VipCandidateDto } from "../automation.types.js";

interface Params {
    limit: number;
}

export const listVipCandidatesUseCase = async ({ limit }: Params): Promise<VipCandidateDto[]> => {
    const config = await shopConfigService.getConfig();

    const vipCoupon = await prisma.coupon.findUnique({
        where: { code: config.vipCouponCode.toUpperCase() },
        select: { id: true, code: true, value: true, type: true },
    });

    if (!vipCoupon) return [];

    // Candidatos: usuarios con gasto histórico >= threshold, activos, que aún NO tienen el cupón VIP asignado.
    const aggregates = await prisma.order.groupBy({
        by: ["userId"],
        where: { isPaid: true },
        _sum: { total: true },
        _count: { _all: true },
        having: { total: { _sum: { gte: config.vipThreshold } } },
        orderBy: { _sum: { total: "desc" } },
    });

    const candidateUserIds = aggregates.map((a) => a.userId);
    if (candidateUserIds.length === 0) return [];

    const alreadyAssigned = await prisma.userCoupon.findMany({
        where: { couponId: vipCoupon.id, userId: { in: candidateUserIds } },
        select: { userId: true },
    });
    const assignedSet = new Set(alreadyAssigned.map((a) => a.userId));

    const eligibleIds = candidateUserIds.filter((id) => !assignedSet.has(id));
    if (eligibleIds.length === 0) return [];

    const users = await prisma.user.findMany({
        where: { id: { in: eligibleIds }, isActive: true },
        select: { id: true, email: true, name: true },
    });
    const usersById = new Map(users.map((u) => [u.id, u]));

    const result: VipCandidateDto[] = [];
    for (const agg of aggregates) {
        const user = usersById.get(agg.userId);
        if (!user) continue;

        result.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            lifetimeSpend: agg._sum.total ?? 0,
            orderCount: agg._count._all,
            vipThreshold: config.vipThreshold,
            vipCouponCode: vipCoupon.code,
            vipCouponValue: vipCoupon.value,
            vipCouponType: vipCoupon.type,
        });

        if (result.length >= limit) break;
    }

    return result;
};
