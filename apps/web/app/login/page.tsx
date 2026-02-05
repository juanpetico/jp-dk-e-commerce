'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '../../src/components/ui/Button';
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
            const result = await login(email, password);
            if (result.success) {
                if (result.role === 'ADMIN') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/profile');
                }
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
        <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-sm border border-border">
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl font-black italic tracking-tighter mb-6 transform -skew-x-12 inline-block border-4 border-black dark:border-white px-2">
                        JP DK
                    </h1>
                    <h2 className="font-display text-2xl font-bold mb-2">Iniciar sesión</h2>
                    <p className="text-muted-foreground text-sm">
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
                                    className="w-full border border-input bg-background text-foreground rounded px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#78350f] border-[#78350f] hover:bg-[#451a03] text-white rounded font-bold normal-case text-lg py-4 shadow-lg transition-all active:scale-[0.98]"
                            >
                                Continuar
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                ¿No tienes cuenta?{' '}
                                <a href="/register" className="text-foreground hover:underline font-bold">
                                    Crear cuenta
                                </a>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={() => setStep('email')}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <p className="text-sm text-muted-foreground">{email}</p>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Contraseña"
                                        className="w-full border border-input bg-background text-foreground rounded px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#78350f] border-[#78350f] hover:bg-[#451a03] text-white rounded font-bold normal-case text-lg py-4 shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Iniciar Sesión
                                </Button>

                                <div className="text-center">
                                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
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
