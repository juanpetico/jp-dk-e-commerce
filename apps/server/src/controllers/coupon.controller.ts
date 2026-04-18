import {
    createCoupon,
    deleteCoupon,
    getAdminUserCoupons,
    getAllCoupons,
    getMyCoupons,
    updateCoupon,
    validateCoupon,
} from "./coupon/coupon.handlers.js";

export const couponController = {
    validateCoupon,
    getAllCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getAdminUserCoupons,
    getMyCoupons,
};
