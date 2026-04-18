'use client';

import AddressModalClient from './address-modal/AddressModalClient';
import { AddressModalProps } from './address-modal/AddressModal.types';

export default function AddressModal({ isOpen, onClose, onSave, onDelete, initialData }: AddressModalProps) {
    return (
        <AddressModalClient
            isOpen={isOpen}
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
            initialData={initialData}
        />
    );
}
