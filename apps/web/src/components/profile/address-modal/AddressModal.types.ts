import { Address } from '@/types';
import { FormEvent, MouseEvent } from 'react';

export interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: Partial<Address>) => void;
    onDelete?: (event: MouseEvent) => void;
    initialData?: Address | null;
}

export interface AddressFormData {
    country: string;
    firstName: string;
    lastName: string;
    rut: string;
    company: string;
    street: string;
    apartment: string;
    zipCode: string;
    comuna: string;
    region: string;
    phone: string;
    isDefault: boolean;
}

export interface AddressModalFormProps {
    formData: AddressFormData;
    errors: Record<string, string>;
    wantsInvoice: boolean;
    regions: string[];
    availableComunas: string[];
    initialData?: Address | null;
    onClose: () => void;
    onDelete?: (event: MouseEvent) => void;
    onSubmit: (event: FormEvent) => void;
    onToggleDefault: (checked: boolean) => void;
    onCountryChange: (value: string) => void;
    onToggleInvoice: (checked: boolean) => void;
    onCompanyChange: (value: string) => void;
    onFieldChange: (field: keyof AddressFormData, value: string) => void;
    onRegionChange: (value: string) => void;
}
