import { body } from "express-validator";

export const productValidation = [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("price")
        .isInt({ min: 0 })
        .withMessage("Price must be a positive integer"),
    body("categoryId").trim().notEmpty().withMessage("Category ID is required"),
    body("variants")
        .isArray({ min: 1 })
        .withMessage("At least one variant (size/stock) is required"),
    body("variants.*.size")
        .isIn(["S", "M", "L", "XL", "XXL", "STD"])
        .withMessage("Invalid size"),
    body("variants.*.stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),
];
