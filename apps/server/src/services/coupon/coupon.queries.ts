export const activeUserCouponsWhere = (userId: string, now: Date) => ({
    userId,
    isUsed: false,
    coupon: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
});
