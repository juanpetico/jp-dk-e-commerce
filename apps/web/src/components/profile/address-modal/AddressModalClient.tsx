'use client';

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { AddressModalProps, AddressFormData } from './AddressModal.types';
import {
    getAvailableComunas,
    getEmptyFormData,
    mapFormDataToAddress,
    mapInitialAddressToFormData,
    REGIONS,
    validateAddressForm,
} from './AddressModal.utils';
import AddressModalForm from './AddressModal.form';

export default function AddressModalClient({ isOpen, onClose, onSave, onDelete, initialData }: AddressModalProps) {
    const [formData, setFormData] = useState<AddressFormData>(getEmptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [wantsInvoice, setWantsInvoice] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (initialData) {
            const nextFormData = mapInitialAddressToFormData(initialData);
            setFormData(nextFormData);
            setWantsInvoice(Boolean(nextFormData.company.trim()));
            setErrors({});
            return;
        }

        setFormData(getEmptyFormData());
        setWantsInvoice(false);
        setErrors({});
    }, [initialData, isOpen]);

    const availableComunas = useMemo(() => getAvailableComunas(formData.region), [formData.region]);

    const clearFieldError = (field: keyof AddressFormData) => {
        if (!errors[field]) {
            return;
        }

        setErrors((current) => ({ ...current, [field]: '' }));
    };

    const handleFieldChange = (field: keyof AddressFormData, value: string) => {
        setFormData((current) => ({ ...current, [field]: value }));
        clearFieldError(field);
    };

    const handleRegionChange = (value: string) => {
        setFormData((current) => ({ ...current, region: value, comuna: '' }));
        clearFieldError('region');
        clearFieldError('comuna');
    };

    const handleToggleInvoice = (checked: boolean) => {
        setWantsInvoice(checked);

        if (!checked) {
            setFormData((current) => ({ ...current, company: '' }));
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        const validationErrors = validateAddressForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        onSave(mapFormDataToAddress(formData));
        onClose();
    };

    const handleDelete = (event: MouseEvent) => {
        event.preventDefault();

        if (!onDelete) {
            return;
        }

        onDelete(event);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-300">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold font-display text-foreground">
                            {initialData ? 'Editar direccion' : 'Agregar direccion'}
                        </h2>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <AddressModalForm
                        formData={formData}
                        errors={errors}
                        wantsInvoice={wantsInvoice}
                        regions={REGIONS}
                        availableComunas={availableComunas}
                        initialData={initialData}
                        onClose={onClose}
                        onDelete={initialData && onDelete ? handleDelete : undefined}
                        onSubmit={handleSubmit}
                        onToggleDefault={(checked) => setFormData((current) => ({ ...current, isDefault: checked }))}
                        onCountryChange={(value) => setFormData((current) => ({ ...current, country: value }))}
                        onToggleInvoice={handleToggleInvoice}
                        onCompanyChange={(value) => handleFieldChange('company', value)}
                        onFieldChange={handleFieldChange}
                        onRegionChange={handleRegionChange}
                    />
                </div>
            </div>
        </div>
    );
}
