"use client";

import React from 'react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
    className?: string;
}

const TablePagination: React.FC<TablePaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    className
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className={cn("flex items-center justify-between px-2 py-4", className)}>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Mostrar</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px] text-xs font-bold rounded-md bg-background border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5" className="text-xs font-bold">5</SelectItem>
                            <SelectItem value="10" className="text-xs font-bold">10</SelectItem>
                            <SelectItem value="20" className="text-xs font-bold">20</SelectItem>
                            <SelectItem value="50" className="text-xs font-bold">50</SelectItem>
                            <SelectItem value="100" className="text-xs font-bold">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-xs font-bold text-muted-foreground uppercase">por página</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase border-l border-border pl-4">
                    Mostrando <span className="text-foreground">{totalItems > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-foreground">{totalItems}</span>
                </span>
            </div>

            {totalPages > 1 && (
                <Pagination className="w-auto mx-0">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={cn(currentPage === 1 && "pointer-events-none opacity-50 cursor-pointer")}
                            />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => onPageChange(page)}
                                            isActive={currentPage === page}
                                            className="h-8 w-8 text-xs font-bold cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            ) {
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                );
                            }
                            return null;
                        })}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-pointer")}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
};

export default TablePagination;
