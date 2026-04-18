import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ProductsPageSkeleton() {
    return (
        <div className="relative overflow-hidden rounded border border-gray-200 bg-white shadow-sm dark:border-none dark:bg-black">
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-[1px] dark:bg-black/20">
                <div className="rounded-full border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-black">
                    <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white" />
                </div>
            </div>

            <div className="animate-pulse">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                                    <th key={item} className="px-6 py-4">
                                        <div className="h-2 w-12 rounded bg-gray-200 dark:bg-gray-800" />
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    <td className="px-6 py-4"><div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-900" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-900" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-100 dark:bg-gray-900" /></td>
                                    <td className="px-6 py-4"><div className="h-6 w-12 rounded-full bg-gray-100 dark:bg-gray-900" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-gray-100 font-mono dark:bg-gray-900" /></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-900" /></td>
                                    <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-16 rounded-lg bg-gray-100 dark:bg-gray-900" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
