'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';

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
            <div className="relative bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-300">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold font-display text-foreground">
                            Editar información personal
                        </h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <div className="relative flex">
                                <div className="flex items-center gap-2 border border-r-0 border-input rounded-l-md px-3 bg-muted">
                                    <span className="text-lg">🇨🇱</span>
                                    <span className="text-sm font-medium text-muted-foreground">+56</span>
                                </div>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="rounded-l-none"
                                    placeholder="9 1234 5678"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
