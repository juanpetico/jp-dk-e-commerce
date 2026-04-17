import { Address } from '@/types';

export interface ProfilePersonalCardProps {
    name: string;
    email: string;
    phone?: string | null;
    onEdit: () => void;
}

export interface ProfileAddressListProps {
    addresses: Address[];
    onAddAddress: () => void;
    onEditAddress: (address: Address) => void;
    onDeleteAddress: (addressId: string, event: React.MouseEvent) => void;
}
