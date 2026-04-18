import React from 'react';
import { Loader2 } from 'lucide-react';

export default function OrdersPageSkeleton() {
    return (
        <div className="relative overflow-hidden rounded border border-border bg-card shadow-sm dark:border-none">
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
                <div className="rounded-full border border-border bg-background p-4 shadow-xl">
                    <Loader2 className="h-6 w-6 animate-spin text-foreground" />
                </div>
            </div>
            <div className="animate-pulse">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border bg-muted/50">
                            <tr>
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <th key={item} className="px-6 py-4">
                                        <div className="h-2 w-12 rounded bg-muted" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-muted" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-muted" /></td>
                                    <td className="px-6 py-4"><div className="mx-auto h-4 w-8 rounded bg-muted" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-muted" /></td>
                                    <td className="px-6 py-4"><div className="h-6 w-24 rounded-full bg-muted" /></td>
                                    <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-8 rounded-lg bg-muted" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
