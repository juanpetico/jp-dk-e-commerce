export const formatOrderTotal = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(price);
};

export const formatOrderDate = (value: string) => {
    return new Date(value).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const formatOrderTime = (value: string) => {
    return new Date(value).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getOrderItemsCount = (items: Array<{ quantity: number }>) => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
};
