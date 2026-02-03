'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Button from '../../src/components/ui/Button';
import { useUser } from '../../src/store/UserContext';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useUser();
    const router = useRouter();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setStep('password');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await login(email, password);
            if (success) {
                // Toast is already handled in UserContext
                router.push('/profile');
            }
            // If !success, do nothing regarding navigation.
            // UserContext already showed the error toast.
            // Password step remains active.
        } catch (error) {
            // Should not happen as login catches errors, but safe to have
            console.error('Login submit error:', error);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl font-black italic tracking-tighter mb-6 transform -skew-x-12 inline-block border-4 border-black dark:border-white px-2">
                        JP DK
                    </h1>
                    <h2 className="font-display text-2xl font-bold mb-2">Iniciar sesión</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {step === 'email' ? 'Inicia sesión o crea una cuenta' : 'Ingresa tu contraseña'}
                    </p>
                </div>

                <div className="space-y-6">
                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Correo electrónico"
                                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                className="bg-[#FF0000] border-[#FF0000] hover:bg-[#CC0000] text-white rounded font-bold normal-case text-base py-3"
                            >
                                Continuar
                            </Button>

                            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                ¿No tienes cuenta?{' '}
                                <a href="/register" className="text-red-600 dark:text-red-500 hover:underline font-bold">
                                    Crear cuenta
                                </a>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={() => setStep('email')}
                                    className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Contraseña"
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    className="bg-[#FF0000] border-[#FF0000] hover:bg-[#CC0000] text-white rounded font-bold normal-case text-base py-3"
                                >
                                    Iniciar Sesión
                                </Button>

                                <div className="text-center">
                                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
