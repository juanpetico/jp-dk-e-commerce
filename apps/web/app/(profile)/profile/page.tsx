'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../src/store/UserContext';
import { Edit, Plus, Trash2 } from 'lucide-react';
import AddressModal from '../../../src/components/profile/AddressModal';
import ProfileEditModal from '../../../src/components/profile/ProfileEditModal';
import { Address } from '../../../src/types';
import { confirm as confirmDialog } from '../../../src/utils/confirm';

export default function ProfilePage() {
    const { user, isAuthenticated, updateProfile, addAddress, updateAddress, deleteAddress } = useUser();
    const router = useRouter();

    // Address Modal State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Profile Edit Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || (user === null && !isAuthenticated)) {
            // Check isAuthenticated first to avoid flicker if user is loading
            // actually user defaults to null
            // isAuthenticated relies on !!user
            // so if user is null, isAuthenticated is false.
            router.push('/login');
        }
    }, [isAuthenticated, user, router]);

    if (!user) {
        return null;
    }

    // Address Handlers
    const handleAddAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async (addressData: Partial<Address>) => {
        // If editing
        if (editingAddress) {
            await updateAddress(editingAddress.id, addressData);
        } else {
            // If adding - cast to expected type or ensure modal returns partial with required fields for creation
            // Assuming the modal validates required fields, we can cast or pick
            await addAddress(addressData as any);
        }
        setIsAddressModalOpen(false);
    };

    // Profile Handler
    const handleSaveProfile = async (data: { name: string; email: string; phone?: string }) => {
        await updateProfile(data);
        setIsProfileModalOpen(false);
    };

    const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent triggering edit if nested
        const isConfirmed = await confirmDialog(
            '¿Eliminar esta dirección?',
            'Esta acción no se puede deshacer y se eliminará permanentemente de tu cuenta.'
        );

        if (isConfirmed) {
            await deleteAddress(id);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl">
                <h1 className="font-display text-3xl font-bold mb-8 text-foreground">Perfil</h1>

                {/* Personal Information */}
                <div className="bg-card text-card-foreground rounded-lg border border-border p-6 mb-8 shadow-sm relative">
                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors p-1.5"
                    >
                        <Edit className="w-4 h-4" />
                    </button>

                    <div className="mb-6">
                        <h2 className="font-bold text-lg text-foreground">{user.name}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-muted-foreground text-sm mb-1">Correo electrónico</p>
                            <p className="text-foreground">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm mb-1">Número de teléfono</p>
                            <p className="text-foreground">{user.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Addresses */}
                <div>
                    <div className="flex items-center gap-6 mb-6">
                        <h2 className="font-bold text-lg text-foreground">Direcciones</h2>
                        <button
                            onClick={handleAddAddress}
                            className="text-[var(--color-amber-900)] text-sm font-bold hover:text-[var(--color-amber-900)] transition-colors flex items-center gap-1.5 bg-[var(--color-amber-900)]/10 dark:bg-[var(--color-amber-900)]/20 px-3 py-1.5 rounded-full"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(!user.addresses || user.addresses.length === 0) ? (
                            <div className="md:col-span-2 flex flex-col items-center justify-center py-12 bg-card text-card-foreground rounded-lg border border-border">
                                <div className="bg-muted p-4 rounded-full mb-4">
                                    <span className="text-3xl">📍</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">No tienes direcciones guardadas</h3>
                                <p className="text-muted-foreground mb-6 text-center max-w-sm">
                                    Agrega una dirección para agilizar tus compras futuras.
                                </p>
                                <button
                                    onClick={handleAddAddress}
                                    className="px-6 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded text-sm font-bold transition-colors"
                                >
                                    Agregar dirección
                                </button>
                            </div>
                        ) : (
                            [...(user.addresses || [])].sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1)).map((addr, index) => (
                                <div key={addr.id} className={`bg-card text-card-foreground rounded-lg border ${addr.isDefault ? 'border-[var(--color-amber-900)] ring-1 ring-[var(--color-amber-900)]' : 'border-border'} p-6 shadow-sm relative group`}>
                                    {/* Action Buttons */}
                                    <div className="absolute top-6 right-6 flex items-center gap-1">
                                        <button
                                            onClick={() => handleEditAddress(addr)}
                                            className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                                            className="text-muted-foreground hover:text-[var(--color-amber-900)] transition-colors p-1.5 rounded-full hover:bg-[var(--color-amber-900)]/10 dark:hover:bg-[var(--color-amber-900)]/20"
                                            title="Eliminar dirección"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {index === 0 && addr.isDefault && (
                                                <span className="bg-[var(--color-amber-900)]/20 text-[var(--color-amber-900)] dark:bg-[var(--color-amber-900)]/30 dark:text-[var(--color-amber-900)] text-xs font-bold px-2 py-1 rounded">
                                                    Predeterminada
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-sm text-foreground space-y-1 mb-4">
                                        <p className="font-bold">{addr.name}</p>
                                        {addr.rut && <p>{addr.rut}</p>}
                                        <p>{addr.street}</p>
                                        <p>{addr.comuna}, {addr.region}</p>
                                        <p>{addr.country}</p>
                                        <p>{addr.phone}</p>
                                    </div>

                                    {/* Button to make default (only if not default/first) */}
                                    {(!addr.isDefault) && (
                                        <button
                                            onClick={() => handleSaveAddress({ ...addr, isDefault: true })}
                                            className="w-full text-xs font-medium text-muted-foreground hover:text-foreground border border-input rounded py-2 hover:border-foreground/20 transition-colors"
                                        >
                                            Esta es mi dirección predeterminada
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSave={handleSaveAddress}
                initialData={editingAddress}
                onDelete={editingAddress ? (e) => handleDeleteAddress(editingAddress.id, e as any) : undefined}
            />

            <ProfileEditModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleSaveProfile}
                initialData={{
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }}
            />
        </div>
    );
}
