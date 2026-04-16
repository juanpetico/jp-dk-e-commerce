import { body } from "express-validator";

export const createOrderValidation = [
    body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),
    body("items.*.productId").notEmpty().withMessage("Product ID is required"),
    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),
    body("items.*.size")
        .isIn(["S", "M", "L", "XL", "XXL", "STD"])
        .withMessage("Invalid size"),
];
