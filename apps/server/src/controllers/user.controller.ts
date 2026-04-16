import {
    addAddress,
    deleteAddress,
    deleteUser,
    getAllUsers,
    getProfile,
    getSession,
    getUserById,
    listUsers,
    login,
    logout,
    register,
    updateAddress,
    updateProfile,
    updateUserRole,
    updateUserStatus,
} from "./user/user.handlers.js";
import {
    addressValidation,
    loginValidation,
    registerValidation,
    updateProfileValidation,
} from "./user/user.validators.js";

export { registerValidation, loginValidation, updateProfileValidation, addressValidation };

export const userController = {
    getSession,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    getAllUsers,
    getUserById,
    deleteUser,
    listUsers,
    updateUserRole,
    updateUserStatus,
};
