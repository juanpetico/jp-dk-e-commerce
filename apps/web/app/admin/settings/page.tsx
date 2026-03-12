'use client';

import React from 'react';
import { Button } from '../../../src/components/ui/Button';
import { Settings, Truck, DollarSign, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-fade-in max-w-4xl text-foreground">
            <div className="mb-8">
                <h1 className="font-display text-4xl font-black uppercase tracking-tight text-foreground">Configuración</h1>
                <p className="text-muted-foreground text-sm">Ajustes generales de la tienda</p>
            </div>

            {/* General Settings */}
            <div className="bg-card p-6 rounded-lg border border-gray-300 dark:border-border shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-6 border-b border-gray-300 dark:border-border pb-2 text-foreground">Información de la Tienda</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Nombre de la tienda</label>
                        <input type="text" defaultValue="JP DK Brand" className="w-full bg-background border border-gray-300 dark:border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground text-foreground" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Correo de soporte</label>
                        <input type="email" defaultValue="contacto@jpdk.cl" className="w-full bg-background border border-gray-300 dark:border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground text-foreground" />
                    </div>
                </div>
            </div>

            {/* Shipping Settings */}
            <div className="bg-card p-6 rounded-lg border border-gray-300 dark:border-border shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-6 border-b border-gray-300 dark:border-border pb-2 text-foreground">Envíos y Logística</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-border rounded bg-muted/20">
                        <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-bold text-sm text-foreground">Starken Integration</p>
                                <p className="text-xs text-muted-foreground">Cálculo automático de tarifas</p>
                            </div>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="toggle" className="peer absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400" defaultChecked />
                            <label htmlFor="toggle" className="block overflow-hidden h-5 rounded-full bg-gray-300 peer-checked:bg-green-400 cursor-pointer"></label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Costo Envío Fijo (Respaldo)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                                <input type="number" defaultValue="4990" className="w-full bg-background border border-gray-300 dark:border-border rounded pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-foreground text-foreground" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Monto para Envío Gratis</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-muted-foreground">$</span>
                                <input type="number" defaultValue="50000" className="w-full bg-background border border-gray-300 dark:border-border rounded pl-6 pr-3 py-2 text-sm focus:outline-none focus:border-foreground text-foreground" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Keys (Integrations) */}
            <div className="bg-card p-6 rounded-lg border border-gray-300 dark:border-border shadow-sm">
                <h3 className="font-bold text-sm uppercase tracking-wide mb-6 border-b border-gray-300 dark:border-border pb-2 text-foreground">Integraciones (API Keys)</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Webpay Plus (Commerce Code)</label>
                        <input type="password" value="597012345678" readOnly className="w-full bg-muted border border-gray-300 dark:border-border rounded px-3 py-2 text-sm font-mono text-muted-foreground cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Google Analytics ID</label>
                        <input type="text" placeholder="G-XXXXXXXXXX" className="w-full bg-background border border-gray-300 dark:border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground text-foreground" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button>Guardar Cambios</Button>
                </div>
            </div>
        </div>
    );
}
