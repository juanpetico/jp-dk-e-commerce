'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface UserData {
    name: string;
    email: string;
    phone?: string;
}

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: UserData) => void;
    initialData: UserData;
}

export default function ProfileEditModal({ isOpen, onClose, onSave, initialData }: ProfileEditModalProps) {
    const [formData, setFormData] = useState<UserData>({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                phone: initialData.phone || '',
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-black rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold font-display text-black dark:text-white">
                            Editar información personal
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Correo electrónico</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
                            <div className="relative flex">
                                <div className="flex items-center gap-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg px-3 bg-gray-50 dark:bg-gray-700">
                                    <span className="text-lg">🇨🇱</span>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">+56</span>
                                </div>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                                    placeholder="9 1234 5678"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
