export const mapUserToResponse = (user: any) => {
    const { password, ...userWithoutPassword } = user;

    if (userWithoutPassword.orders) {
        const validOrders = userWithoutPassword.orders.filter(
            (o: any) => o.status === "CONFIRMED" || o.status === "DELIVERED" || o.isPaid
        );

        userWithoutPassword.totalSpent = validOrders.reduce((sum: number, o: any) => sum + o.total, 0);
        userWithoutPassword.ordersCount = validOrders.length;

        if (validOrders.length > 0) {
            const sortedByDate = [...validOrders].sort(
                (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            userWithoutPassword.lastOrder = sortedByDate[0].date;
        } else {
            userWithoutPassword.lastOrder = "-";
        }

        userWithoutPassword.status = userWithoutPassword.isActive ? "Active" : "Inactive";

        userWithoutPassword.orders = userWithoutPassword.orders.map((order: any) => ({
            ...order,
            items: order.items.map((item: any) => ({
                ...item,
                ...item.product,
                id: item.id,
                price: item.price,
                productId: item.productId,
            })),
        }));
    }

    return userWithoutPassword;
};
