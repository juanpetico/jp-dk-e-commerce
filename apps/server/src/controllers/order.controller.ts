import {
    cancelOrder,
    createOrder,
    getAllOrders,
    getOrderById,
    getUserOrders,
    markOrderAsPaid,
    updateOrderStatus,
    getTopProducts,
    getDashboardCartFunnel,
} from "./order/order.handlers.js";
import { createOrderValidation } from "./order/order.validators.js";

export { createOrderValidation };

export const orderController = {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    markOrderAsPaid,
    cancelOrder,
    getTopProducts,
    getDashboardCartFunnel,
};
