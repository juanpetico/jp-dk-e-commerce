import type { Request } from "express";

/**
 * Safely get a route parameter as a string
 * Throws if the parameter is missing or is an array
 */
export function getParam(req: Request, paramName: string): string {
    const value = req.params[paramName];

    if (!value) {
        throw new Error(`Missing required parameter: ${paramName}`);
    }

    if (Array.isArray(value)) {
        throw new Error(`Parameter ${paramName} cannot be an array`);
    }

    return value;
}

/**
 * Safely get a query parameter as a string
 */
export function getQuery(req: Request, queryName: string): string | undefined {
    const value = req.query[queryName];

    if (!value) {
        return undefined;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        return value[0];
    }

    return undefined;
}
