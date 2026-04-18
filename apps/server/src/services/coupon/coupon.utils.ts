export const normalizeCouponStartDate = (value?: string | Date) => {
    const startDate = value ? new Date(value) : new Date();
    startDate.setHours(0, 0, 0, 0);
    return startDate;
};

export const normalizeCouponEndDate = (value?: string | Date | null) => {
    if (value === null) return null;
    if (!value) return undefined;
    const endDate = new Date(value);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
};
