import type { Request } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../../middleware/error-handler.js";

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

export const parsePublishedFilter = (value: unknown): boolean | undefined => {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
};
