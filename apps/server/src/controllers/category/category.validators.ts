import { body } from "express-validator";

export const categoryValidation = [
    body("name").trim().notEmpty().withMessage("Category name is required"),
];

export const categoryPartialValidation = [
    body("isPublished")
        .optional()
        .isBoolean()
        .withMessage("isPublished must be a boolean"),
    body("sortOrder")
        .optional()
        .isInt()
        .withMessage("sortOrder must be an integer"),
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category name cannot be empty"),
];
