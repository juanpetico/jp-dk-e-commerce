export const VALID_USER_ROLES = ["CLIENT", "ADMIN", "SUPERADMIN"] as const;

export type UserRole = (typeof VALID_USER_ROLES)[number];

export interface UserListParams {
    search?: string;
    role?: string;
    status?: string;
    cursor?: string;
    limit?: number;
}

export interface CreateUserData {
    email: string;
    password: string;
    name?: string;
    role?: "CLIENT" | "ADMIN";
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
}

export interface AddressMutationData {
    name: string;
    rut?: string;
    street: string;
    city?: string;
    comuna: string;
    region: string;
    zipCode?: string;
    country: string;
    phone: string;
    company?: string;
    isDefault?: boolean;
    isActive?: boolean;
}
