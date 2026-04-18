import prisma from "../config/prisma.js";
import { getUsersUseCase } from "./user/use-cases/get-users.js";
import type { AddressMutationData, CreateUserData, UpdateUserData } from "./user/user.types.js";
import { getAllUsersUseCase } from "./user/use-cases/get-all-users.js";
import { updateUserRoleUseCase } from "./user/use-cases/update-user-role.js";
import { toggleUserStatusUseCase } from "./user/use-cases/toggle-user-status.js";
import { createUserUseCase } from "./user/use-cases/create-user.js";
import { getUserByIdUseCase } from "./user/use-cases/get-user-by-id.js";
import { getUserByEmailUseCase } from "./user/use-cases/get-user-by-email.js";
import { getUserByEmailWithPasswordUseCase } from "./user/use-cases/get-user-by-email-with-password.js";
import { updateUserUseCase } from "./user/use-cases/update-user.js";
import { deleteUserUseCase } from "./user/use-cases/delete-user.js";
import { addAddressUseCase } from "./user/use-cases/add-address.js";
import { updateAddressUseCase } from "./user/use-cases/update-address.js";
import { deleteAddressUseCase } from "./user/use-cases/delete-address.js";
import { mapUserToResponse } from "./user/user.mappers.js";

export const userService = {
    async createUser(data: CreateUserData) {
        return createUserUseCase(data);
    },

    async getUserById(id: string) {
        return getUserByIdUseCase(id);
    },

    async getUserByEmail(email: string) {
        return getUserByEmailUseCase(email);
    },

    async getUserByEmailWithPassword(email: string) {
        return getUserByEmailWithPasswordUseCase(email);
    },

    async updateUser(id: string, data: UpdateUserData) {
        return updateUserUseCase(id, data);
    },

    async deleteUser(id: string) {
        return deleteUserUseCase(id);
    },

    async getAllUsers(params?: { role?: string }) {
        const users = await getAllUsersUseCase(params);
        return users.map(mapUserToResponse);
    },

    async getUsers(params: {
        search?: string;
        role?: string;
        status?: string;
        cursor?: string;
        limit?: number;
    }) {
        return getUsersUseCase(params);
    },

    async updateUserRole(actorId: string, targetId: string, newRole: string) {
        return updateUserRoleUseCase(actorId, targetId, newRole);
    },

    async toggleUserStatus(actorId: string, targetId: string, newIsActive: boolean, deactivationReason?: string) {
        return toggleUserStatusUseCase(actorId, targetId, newIsActive, deactivationReason);
    },

    // Address Management
    async addAddress(userId: string, data: AddressMutationData) {
        return addAddressUseCase(userId, data);
    },

    async updateAddress(userId: string, addressId: string, data: AddressMutationData) {
        return updateAddressUseCase(userId, addressId, data);
    },

    async deleteAddress(userId: string, addressId: string) {
        return deleteAddressUseCase(userId, addressId);
    },
};
