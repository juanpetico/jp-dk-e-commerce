import prisma from "../config/prisma.js";
import { AppError } from "../middleware/error-handler.js";
import { couponService } from "./coupon.service.js";
import { shopConfigService } from "./shop-config.service.js";
import { createLog } from "./audit.service.js";
import { getUserOrdersUseCase } from "./order/use-cases/get-user-orders.js";
import { getOrderByIdUseCase } from "./order/use-cases/get-order-by-id.js";
import { getAllOrdersUseCase } from "./order/use-cases/get-all-orders.js";
import { updateOrderStatusUseCase } from "./order/use-cases/update-order-status.js";
import { markOrderAsPaidUseCase } from "./order/use-cases/mark-order-as-paid.js";
import { cancelOrderUseCase } from "./order/use-cases/cancel-order.js";
import { createOrderUseCase } from "./order/use-cases/create-order.js";
import { getTopProductsUseCase } from "./order/use-cases/get-top-products.js";
import { getDashboardCartFunnelUseCase } from "./order/use-cases/get-dashboard-cart-funnel.js";
import {
    getDashboardCustomerRetentionUseCase,
    type DashboardRetentionRange,
} from "./order/use-cases/get-dashboard-customer-retention.js";
import type { OrderFilters, OrderItemInput, OrderStatus } from "./order/order.types.js";

export const orderService = {
    async createOrder(userId: string, items: OrderItemInput[], shippingAddressId?: string, billingAddressId?: string, couponCode?: string) {
        return createOrderUseCase(userId, items, shippingAddressId, billingAddressId, couponCode);
    },

    async getUserOrders(userId: string) {
        return getUserOrdersUseCase(userId);
    },

    async getOrderById(orderId: string, userId?: string) {
        return getOrderByIdUseCase(orderId, userId);
    },

    async getAllOrders(filters?: OrderFilters) {
        return getAllOrdersUseCase(filters);
    },

    async updateOrderStatus(orderId: string, status: OrderStatus, actorId: string) {
        return updateOrderStatusUseCase(orderId, status, actorId);
    },

    async markOrderAsPaid(orderId: string) {
        return markOrderAsPaidUseCase(orderId);
    },

    async cancelOrder(orderId: string, userId?: string) {
        return cancelOrderUseCase(orderId, userId);
    },

    async getTopProducts(limit?: number) {
        return getTopProductsUseCase(limit);
    },

    async getDashboardCartFunnel() {
        return getDashboardCartFunnelUseCase();
    },

    async getDashboardCustomerRetention(range?: DashboardRetentionRange) {
        return getDashboardCustomerRetentionUseCase(range);
    },
};
