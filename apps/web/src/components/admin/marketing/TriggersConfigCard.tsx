'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Settings, Save, Loader2, ChevronDown } from 'lucide-react';
import SonnerConfirm from '@/components/ui/SonnerConfirm';
import { TriggersConfigSections } from './TriggersConfigCard.sections';
import { useTriggersConfigForm } from './useTriggersConfigForm';

export default function TriggersConfigCard() {
    const [isExpanded, setIsExpanded] = useState(false);

    const {
        loading,
        isSaving,
        formData,
        setField,
        setCouponType,
        setUpperTextField,
        confirmDialog,
        openSaveConfirm,
        closeConfirmDialog,
    } = useTriggersConfigForm();

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cargando triggers...</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-500">
            <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="w-full p-5 border-b border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Settings className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-display font-black uppercase text-base tracking-tight text-foreground">Drivers de Fidelización</h2>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Bienvenida · VIP — asignación automática</p>
                        </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isExpanded && (
                <>
                    <div className="p-6 space-y-8">
                        <TriggersConfigSections
                            formData={formData}
                            setField={setField}
                            setCouponType={setCouponType}
                            setUpperTextField={setUpperTextField}
                        />
                    </div>

                    <div className="p-6 bg-muted/20 border-t border-border flex justify-end">
                        <Button
                            onClick={openSaveConfirm}
                            disabled={isSaving}
                            className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs h-10 px-6 gap-2"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                        </Button>
                    </div>
                </>
            )}

            <SonnerConfirm
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                description={confirmDialog.description}
                onConfirm={confirmDialog.onConfirm}
                onCancel={closeConfirmDialog}
            />
        </div>
    );
}
