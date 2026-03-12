'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Download, Loader2, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfBlob: Blob | null;
    isLoading: boolean;
    fileName?: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, pdfBlob, isLoading, fileName = 'reporte.pdf' }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [pdfBlob]);

    const handleDownload = () => {
        if (!previewUrl) return;
        const link = document.createElement('a');
        link.href = previewUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold">Vista Previa del Reporte</DialogTitle>
                            <p className="text-xs text-muted-foreground">Revise el documento antes de descargar</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="text-xs h-9"
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleDownload}
                            disabled={!pdfBlob || isLoading}
                            className="text-xs h-9 font-bold flex gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Descargar PDF
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 bg-muted/10 dark:bg-muted/5 w-full h-full">
                    <div className="p-8 flex items-center justify-center min-h-full">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-sm font-medium text-muted-foreground animate-pulse">Generando reporte...</p>
                            </div>
                        ) : previewUrl ? (
                            <div className="w-full max-w-[800px] aspect-[1/1.414] bg-white shadow-2xl rounded-sm overflow-hidden border border-border/50">
                                <iframe
                                    src={`${previewUrl}#toolbar=0&navpanes=0`}
                                    className="w-full h-full border-none"
                                    title="PDF Preview"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center text-muted-foreground text-sm">
                                No se pudo generar la vista previa
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default ReportModal;
