'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/input';
import { Label } from '../../src/components/ui/label';
import { useUser } from '../../src/store/UserContext';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const [step, setStep] = useState<'email' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

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
                if (redirectUrl) {
                    router.push(redirectUrl);
                } else if (result.role === 'SUPERADMIN') {
                    router.push('/superadmin/dashboard');
                } else if (result.role === 'ADMIN') {
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
                    <h2 className="font-display text-2xl font-bold mb-2 tracking-tight">Iniciar sesión</h2>
                    <p className="text-muted-foreground text-sm">
                        {step === 'email' ? 'Inicia sesión o crea una cuenta' : 'Ingresa tu contraseña para continuar'}
                    </p>
                </div>

                <div className="space-y-6">
                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
                                    Email <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ejemplo@correo.com"
                                        className="pl-10 h-12"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                                className="w-full bg-[#78350f] hover:bg-[#451a03] text-white rounded font-bold normal-case text-lg py-6 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continuar
                            </Button>

                            <div className="text-center text-sm text-muted-foreground pt-2">
                                ¿No tienes cuenta?{' '}
                                <a href="/register" className="text-[#92400e] hover:text-[#78350f] hover:underline font-bold transition-colors">
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

                            <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-semibold">Contraseña <span className="text-red-500 ml-1">*</span></Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-10 h-12"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#78350f] hover:bg-[#451a03] text-white rounded font-bold normal-case text-lg py-6 shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Iniciar Sesión
                                </Button>

                                <div className="text-center pt-2">
                                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">
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
