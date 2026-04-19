import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default error values
    let statusCode = 500;
    let message = "Internal server error";
    let errors: any = undefined;

    // Handle custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle Prisma errors
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;

        switch (err.code) {
            case "P2002":
                message = "A record with this value already exists";
                const target = (err.meta?.target as string[]) || [];
                errors = { field: target[0], message: `${target[0]} already exists` };
                break;
            case "P2025":
                message = "Record not found";
                statusCode = 404;
                break;
            case "P2003":
                message = "Foreign key constraint failed";
                break;
            default:
                message = "Database error";
        }
    }
    // Handle Prisma validation errors
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Validation error";
    }
    // Handle generic errors — don't expose internal details in production
    else if (err instanceof Error) {
        if (process.env.NODE_ENV === "development") {
            message = err.message;
        }
        // In production, keep the default "Internal server error" message
    }

    // Log server-side (no body, no PII) — useful in all environments
    const userId = (req as Request & { user?: { id?: string } }).user?.id;
    console.error(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} — status ${statusCode}${userId ? ` user=${userId}` : ""}`,
        err instanceof Error ? (err.stack || err.message) : err
    );

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        errors,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
