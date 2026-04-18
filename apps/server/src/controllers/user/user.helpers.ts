import type { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../../middleware/error-handler.js";

const SESSION_COOKIE = "token";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const setSessionCookie = (res: Response, token: string) => {
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE_MS,
        path: "/",
    });
};

export const clearSessionCookie = (res: Response) => {
    res.clearCookie(SESSION_COOKIE, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
};

export const assertValidationOk = (req: Request) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array().map((e) => e.msg).join(", "), 400);
    }
};
