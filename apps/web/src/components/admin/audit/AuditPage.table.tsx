import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AuditEntry } from '@/types';
import { ActionBadge } from './AuditPage.badges';
import ChangeDetail from './AuditPage.change-detail';
import { formatDate } from './AuditPage.utils';

interface AuditPageTableProps {
    logs: AuditEntry[];
}

export default function AuditPageTable({ logs }: AuditPageTableProps) {
    return (
        <Table className="w-full table-fixed">
            <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent dark:border-gray-800">
                    <TableHead className="w-[18%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Fecha
                    </TableHead>
                    <TableHead className="w-[28%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Actor
                    </TableHead>
                    <TableHead className="w-[16%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Accion
                    </TableHead>
                    <TableHead className="w-[38%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Detalles
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {logs.map((log) => (
                    <TableRow key={log.id} className="transition-colors hover:bg-muted/40">
                        <TableCell className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground">
                                    {formatDate(log.createdAt).split(',')[0]}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                                    {new Date(log.createdAt).toLocaleTimeString('es-CL', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-xs font-semibold text-foreground">
                                    {log.actor.name ?? 'Sin nombre'}
                                </span>
                                <span className="truncate font-mono text-[10px] text-muted-foreground">
                                    {log.actor.email}
                                </span>
                            </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                            <ActionBadge action={log.action} />
                        </TableCell>

                        <TableCell className="break-words px-6 py-4">
                            <ChangeDetail entry={log} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
