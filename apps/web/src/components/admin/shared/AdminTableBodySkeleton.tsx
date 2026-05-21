import React from 'react';

interface AdminTableBodySkeletonProps {
    columns?: number;
    rows?: number;
}

export default function AdminTableBodySkeleton({ columns = 5, rows = 5 }: AdminTableBodySkeletonProps) {
    return (
        <div className="animate-pulse overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
            <table className="w-full">
                <thead className="border-b border-border">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-6 py-4">
                                <div className="h-2 w-16 rounded bg-muted" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {Array.from({ length: rows }).map((_, row) => (
                        <tr key={row}>
                            {Array.from({ length: columns }).map((_, col) => (
                                <td key={col} className="px-6 py-4">
                                    <div
                                        className={`rounded bg-muted ${
                                            col === columns - 1
                                                ? 'ml-auto h-4 w-14'
                                                : col === 0
                                                  ? 'h-8 w-8'
                                                  : 'h-4 w-20'
                                        }`}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
