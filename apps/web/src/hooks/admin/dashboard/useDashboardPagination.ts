import { useEffect, useMemo, useState } from 'react';

interface UseDashboardPaginationOptions {
    initialItemsPerPage?: number;
}

export function useDashboardPagination<T>(
    items: T[],
    options: UseDashboardPaginationOptions = {}
) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(options.initialItemsPerPage ?? 5);

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;

    const paginatedItems = useMemo(() => {
        return items.slice(startIndex, startIndex + itemsPerPage);
    }, [items, startIndex, itemsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        startIndex,
        paginatedItems,
        setCurrentPage,
        setItemsPerPage,
    };
}
