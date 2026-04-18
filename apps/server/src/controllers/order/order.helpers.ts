import type { Request } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../../middleware/error-handler.js";
import type { OrderFilters, OrderStatus } from "../../services/order/order.types.js";

const VALID_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

export const assertValidationOk = (req: Request) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(
            errors
                .array()
                .map((e) => e.msg)
                .join(", "),
            400
        );
    }
};

export const isValidOrderStatus = (status: string): status is OrderStatus => {
    return VALID_STATUSES.includes(status as OrderStatus);
};

export const parseOrderFilters = (req: Request): OrderFilters => {
    const { status, startDate, endDate, search } = req.query;

    const filters: OrderFilters = {};

    if (status && typeof status === "string" && isValidOrderStatus(status)) {
        filters.status = status;
    }

    if (startDate && typeof startDate === "string") {
        const parsedDate = new Date(startDate);
        if (!isNaN(parsedDate.getTime())) {
            filters.startDate = parsedDate;
        }
    }

    if (endDate && typeof endDate === "string") {
        const parsedDate = new Date(endDate);
        if (!isNaN(parsedDate.getTime())) {
            parsedDate.setHours(23, 59, 59, 999);
            filters.endDate = parsedDate;
        }
    }

    if (search && typeof search === "string" && search.trim()) {
        filters.search = search.trim();
    }

    return filters;
};
