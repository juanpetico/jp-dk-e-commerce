import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error-handler.js";

export const requireInternalApiKey = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const configured = process.env.INTERNAL_API_KEY;

    if (!configured) {
        return next(new AppError("INTERNAL_API_KEY no configurado en el servidor", 500));
    }

    const provided = req.header("x-internal-api-key");

    if (!provided || provided !== configured) {
        return next(new AppError("Unauthorized: invalid internal API key", 401));
    }

    next();
};
