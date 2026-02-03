'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../src/store/UserContext';
import { Edit, Plus } from 'lucide-react';
import AddressModal from '../../../src/components/profile/AddressModal';
import ProfileEditModal from '../../../src/components/profile/ProfileEditModal';
import { Address } from '../../../src/types';

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
        if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
            await deleteAddress(id);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-4xl">
                <h1 className="font-display text-3xl font-bold mb-8 text-black dark:text-white">Perfil</h1>

                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6 mb-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="font-bold text-lg text-black dark:text-white">{user.name}</h2>
                        <button
                            onClick={() => setIsProfileModalOpen(true)}
                            className="text-red-600 hover:text-red-700 transition-colors bg-red-50 dark:bg-red-900/20 p-1.5 rounded-full"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Correo electrónico</p>
                            <p className="text-gray-900 dark:text-white">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Número de teléfono</p>
                            <p className="text-gray-900 dark:text-white">{user.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Addresses */}
                <div>
                    <div className="flex items-center gap-6 mb-6">
                        <h2 className="font-bold text-lg text-black dark:text-white">Direcciones</h2>
                        <button
                            onClick={handleAddAddress}
                            className="text-red-600 text-sm font-bold hover:text-red-700 transition-colors flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...(user.addresses || [])].sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1)).map((addr, index) => (
                            <div key={addr.id} className={`bg-white dark:bg-gray-800 rounded-lg border ${addr.isDefault ? 'border-red-600 dark:border-red-600 ring-1 ring-red-600' : 'border-gray-100 dark:border-gray-700'} p-6 shadow-sm relative group`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {index === 0 && addr.isDefault && (
                                            <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">
                                                Predeterminada
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEditAddress(addr)}
                                            className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors p-1.5"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                                            className="text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-full"
                                        >
                                            <span className="text-xl leading-none block -mt-1">×</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1 mb-4">
                                    <p className="font-bold">{addr.name}</p>
                                    {addr.rut && <p>{addr.rut}</p>}
                                    <p>{addr.street}</p>
                                    <p>{addr.city}, {addr.region}</p>
                                    <p>{addr.country}</p>
                                    <p>{addr.phone}</p>
                                </div>

                                {/* Button to make default (only if not default/first) */}
                                {(!addr.isDefault) && (
                                    <button
                                        onClick={() => handleSaveAddress({ ...addr, isDefault: true })}
                                        className="w-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded py-2 hover:border-gray-400 transition-colors"
                                    >
                                        Esta es mi dirección predeterminada
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSave={handleSaveAddress}
                initialData={editingAddress}
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
