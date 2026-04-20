import { body } from "express-validator";

export const categoryValidation = [
    body("name").trim().notEmpty().withMessage("Category name is required"),
    body("imageUrl")
        .optional({ nullable: true })
        .customSanitizer((value) => {
            if (typeof value !== "string") return value;
            const trimmed = value.trim();
            return trimmed === "" ? null : trimmed;
        })
        .custom((value) => {
            if (value === null || value === undefined) return true;
            if (typeof value !== "string") return false;

            try {
                const parsed = new URL(value);
                return parsed.protocol === "http:" || parsed.protocol === "https:";
            } catch {
                return false;
            }
        })
        .withMessage("imageUrl must be a valid HTTP/HTTPS URL"),
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
    body("imageUrl")
        .optional({ nullable: true })
        .customSanitizer((value) => {
            if (typeof value !== "string") return value;
            const trimmed = value.trim();
            return trimmed === "" ? null : trimmed;
        })
        .custom((value) => {
            if (value === null || value === undefined) return true;
            if (typeof value !== "string") return false;

            try {
                const parsed = new URL(value);
                return parsed.protocol === "http:" || parsed.protocol === "https:";
            } catch {
                return false;
            }
        })
        .withMessage("imageUrl must be a valid HTTP/HTTPS URL"),
];
