'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/store/UserContext';
import { Address } from '@/types';
import AddressModal from '@/components/profile/AddressModal';
import ProfileEditModal from '@/components/profile/ProfileEditModal';
import { confirm as confirmDialog } from '@/utils/confirm';
import ProfilePageAddressList from './ProfilePage.address-list';
import ProfilePagePersonalCard from './ProfilePage.personal-card';

export default function ProfilePageClient() {
    const { user, isAuthenticated, updateProfile, addAddress, updateAddress, deleteAddress } = useUser();
    const router = useRouter();

    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || (user === null && !isAuthenticated)) {
            router.push('/login');
        }
    }, [isAuthenticated, user, router]);

    if (!user) {
        return null;
    }

    const handleAddAddress = () => {
        setEditingAddress(null);
        setIsAddressModalOpen(true);
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = async (addressData: Partial<Address>) => {
        if (editingAddress) {
            await updateAddress(editingAddress.id, addressData);
        } else {
            await addAddress(addressData as Omit<Address, 'id'>);
        }

        setIsAddressModalOpen(false);
    };

    const handleSaveProfile = async (data: { name: string; email: string; phone?: string }) => {
        await updateProfile(data);
        setIsProfileModalOpen(false);
    };

    const handleDeleteAddress = async (id: string, event: React.MouseEvent) => {
        event.stopPropagation();

        const isConfirmed = await confirmDialog(
            '¿Eliminar esta direccion?',
            'Esta accion no se puede deshacer y se eliminara permanentemente de tu cuenta.'
        );

        if (isConfirmed) {
            await deleteAddress(id);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-4xl">
                <h1 className="font-display text-3xl font-bold mb-8 text-foreground">Perfil</h1>

                <ProfilePagePersonalCard
                    name={user.name}
                    email={user.email}
                    phone={user.phone}
                    onEdit={() => setIsProfileModalOpen(true)}
                />

                <ProfilePageAddressList
                    addresses={user.addresses || []}
                    onAddAddress={handleAddAddress}
                    onEditAddress={handleEditAddress}
                    onDeleteAddress={handleDeleteAddress}
                />
            </div>

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                onSave={handleSaveAddress}
                initialData={editingAddress}
                onDelete={editingAddress ? (event) => handleDeleteAddress(editingAddress.id, event) : undefined}
            />

            <ProfileEditModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                onSave={handleSaveProfile}
                initialData={{
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                }}
            />
        </div>
    );
}
