export const VALID_USER_ROLES = ["CLIENT", "ADMIN", "SUPERADMIN"] as const;

export type UserRole = (typeof VALID_USER_ROLES)[number];

export interface UserListParams {
    search?: string;
    role?: string;
    status?: string;
    cursor?: string;
    limit?: number;
}
