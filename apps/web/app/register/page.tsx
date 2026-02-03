'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../src/components/ui/Button';
import { toast } from 'sonner';
import { useUser } from '../../src/store/UserContext';
import Link from 'next/link';

export default function RegisterPage() {
    const [step, setStep] = useState<'email' | 'password' | 'complete'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const { register } = useUser();
    const router = useRouter();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setStep('password');
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === confirmPassword) {
            setStep('complete');
        }
    };

    const handleCompleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            register(email, password, name, phone);
            toast.success('Cuenta creada exitosamente');
            router.push('/profile');
        } catch (error) {
            toast.error('Error al crear la cuenta');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl font-black italic tracking-tighter mb-6 transform -skew-x-12 inline-block border-4 border-black dark:border-white px-2">
                        JP DK
                    </h1>
                    <h2 className="font-display text-2xl font-bold mb-2">Crear cuenta</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {step === 'email' ? 'Ingresa tu correo electrónico' :
                            step === 'password' ? 'Crea una contraseña segura' :
                                'Completa tu perfil'}
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
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="text-red-600 dark:text-red-500 hover:underline font-bold">
                                    Iniciar sesión
                                </Link>
                            </div>
                        </form>
                    ) : step === 'password' ? (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={() => setStep('email')}
                                    className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <span className="text-xl">←</span>
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
                                        minLength={6}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mínimo 6 caracteres</p>
                                </div>

                                <div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirmar contraseña"
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={password !== confirmPassword || password.length < 6}
                                    className="bg-[#FF0000] border-[#FF0000] hover:bg-[#CC0000] text-white rounded font-bold normal-case text-base py-3"
                                >
                                    Continuar
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={() => setStep('password')}
                                    className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    <span className="text-xl">←</span>
                                </button>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
                            </div>

                            <form onSubmit={handleCompleteSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nombre completo"
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Teléfono (opcional)"
                                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    className="bg-[#FF0000] border-[#FF0000] hover:bg-[#CC0000] text-white rounded font-bold normal-case text-base py-3"
                                >
                                    Crear cuenta
                                </Button>

                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Al crear una cuenta, aceptas nuestros{' '}
                                    <a href="#" className="text-red-600 dark:text-red-500 hover:underline">Términos y Condiciones</a>
                                    {' '}y{' '}
                                    <a href="#" className="text-red-600 dark:text-red-500 hover:underline">Política de Privacidad</a>
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
