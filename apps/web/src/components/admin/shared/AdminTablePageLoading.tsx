import React from 'react';

interface AdminTablePageLoadingProps {
    columns?: number;
    rows?: number;
    hasStats?: 0 | 3 | 4;
    hasTabs?: boolean;
}

export default function AdminTablePageLoading({
    columns = 5,
    rows = 5,
    hasStats = 0,
    hasTabs = false,
}: AdminTablePageLoadingProps) {
    return (
        <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
                <div className="h-7 w-44 rounded-md bg-muted" />
                <div className="h-9 w-36 rounded-md bg-muted" />
            </div>

            {hasStats === 3 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-24 rounded-lg bg-muted" />
                    ))}
                </div>
            )}

            {hasStats === 4 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-24 rounded-lg bg-muted" />
                    ))}
                </div>
            )}

            {hasTabs && (
                <div className="flex gap-1 border-b border-border pb-px">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-9 w-24 rounded-t-md bg-muted" />
                    ))}
                </div>
            )}

            <div className="flex flex-wrap gap-3">
                <div className="h-9 w-64 rounded-md bg-muted" />
                <div className="h-9 w-28 rounded-md bg-muted" />
                <div className="h-9 w-28 rounded-md bg-muted" />
            </div>

            <div className="overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
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
                                            className={`h-4 rounded bg-muted ${
                                                col === columns - 1
                                                    ? 'ml-auto w-14'
                                                    : col === 0
                                                      ? 'h-8 w-8'
                                                      : 'w-20'
                                            }`}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
