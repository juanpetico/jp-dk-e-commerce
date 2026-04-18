import { ModalTab } from './types';

export const USER_EDIT_TABS: Array<{ key: ModalTab; label: string }> = [
    { key: 'PROFILE', label: 'Perfil' },
    { key: 'ROLE', label: 'Rol' },
    { key: 'STATUS', label: 'Estado' },
    { key: 'AUDIT', label: 'Auditoria' },
];

export const USER_ROLE_OPTIONS = [
    { value: 'CLIENT', label: 'Cliente' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SUPERADMIN', label: 'Superadmin' },
] as const;
