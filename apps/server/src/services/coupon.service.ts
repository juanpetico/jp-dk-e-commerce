import { getAllCouponsUseCase } from "./coupon/use-cases/get-all-coupons.js";
import { createCouponUseCase } from "./coupon/use-cases/create-coupon.js";
import { updateCouponUseCase } from "./coupon/use-cases/update-coupon.js";
import { deleteCouponUseCase } from "./coupon/use-cases/delete-coupon.js";
import { validateCouponUseCase } from "./coupon/use-cases/validate-coupon.js";
import { assignCouponToUserUseCase } from "./coupon/use-cases/assign-coupon-to-user.js";
import { getUserCouponsUseCase } from "./coupon/use-cases/get-user-coupons.js";
import { getAdminUserCouponsUseCase } from "./coupon/use-cases/get-admin-user-coupons.js";
import type { CouponMutationData, CreateCouponData } from "./coupon/coupon.types.js";

export const couponService = {
    async validateCoupon(code: string, userId: string, currentTotal: number, tx?: any) {
        return validateCouponUseCase(code, userId, currentTotal, tx);
    },

    async getAllCoupons() {
        return getAllCouponsUseCase();
    },

    async createCoupon(data: CreateCouponData, actorId: string) {
        return createCouponUseCase(data, actorId);
    },

    async updateCoupon(id: string, data: CouponMutationData, actorId: string) {
        return updateCouponUseCase(id, data, actorId);
    },

    async deleteCoupon(id: string, actorId: string) {
        return deleteCouponUseCase(id, actorId);
    },

    async assignCouponToUser(userId: string, couponCode: string, tx?: any) {
        return assignCouponToUserUseCase(userId, couponCode, tx);
    },

    async getUserCoupons(userId: string) {
        return getUserCouponsUseCase(userId);
    },

    async getAdminUserCoupons(userId: string) {
        return getAdminUserCouponsUseCase(userId);
    },
};
