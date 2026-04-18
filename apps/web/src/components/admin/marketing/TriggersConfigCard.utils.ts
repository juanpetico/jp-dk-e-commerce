export const formatTriggerNumber = (val: number | string | null | undefined) => {
    if (val === undefined || val === null || val === '') return '';
    const parts = val.toString().split('.');
    if (parts[0]) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return parts.join(',');
};

export const parseTriggerNumber = (val: string) => {
    const clean = val.replace(/\./g, '').replace(',', '.');
    if (clean === '') return 0;
    return parseFloat(clean) || 0;
};
