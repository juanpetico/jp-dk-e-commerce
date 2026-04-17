export const PAGE_SIZE = 9;

export const formatMarketingPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
};
