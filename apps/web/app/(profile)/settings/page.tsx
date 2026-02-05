'use client';

import React from 'react';
import { useUser } from '../../../src/store/UserContext';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { logout } = useUser();
    const router = useRouter();

    const handleLogoutAll = () => {
        // En un caso real, esto llamaría a una API para invalidar todos los tokens.
        // Por ahora, simulamos cerrando la sesión local.
        logout();
        router.push('/login');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-display text-2xl font-bold mb-8">Configuración</h1>

            <div className="flex flex-col md:flex-row md:items-start gap-8">
                {/* Left Side: Description */}
                <div className="md:w-1/3">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-4 h-4" />
                        <h2 className="font-bold text-sm">Cerrar todas las sesiones</h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        Si perdiste un dispositivo o tienes inquietudes relacionadas con la seguridad, cierra todas las sesiones para garantizar la seguridad de tu cuenta.
                    </p>
                </div>

                {/* Right Side: Action Card */}
                <div className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <button
                            onClick={handleLogoutAll}
                            className="whitespace-nowrap border border-red-200 text-red-600 px-6 py-2 rounded font-bold text-sm hover:bg-red-50 transition-colors"
                        >
                            Cerrar todas las sesiones
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            También se cerrará tu sesión en este dispositivo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
