import { AUDITABLE_CONFIG_FIELDS } from "./shop-config.constants.js";
import type { AuditableField, UpdateConfigData } from "./shop-config.types.js";

export const buildConfigAuditDiff = (
    currentConfig: Record<string, unknown>,
    data: UpdateConfigData
) => {
    const oldValues: Partial<Record<AuditableField, unknown>> = {};
    const newValues: Partial<Record<AuditableField, unknown>> = {};

    for (const field of AUDITABLE_CONFIG_FIELDS) {
        const incoming = (data as Record<string, unknown>)[field];
        if (incoming !== undefined && currentConfig[field] !== incoming) {
            oldValues[field] = currentConfig[field];
            newValues[field] = incoming;
        }
    }

    return { oldValues, newValues };
};
