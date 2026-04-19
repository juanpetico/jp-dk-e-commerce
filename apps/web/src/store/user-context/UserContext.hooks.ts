import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { Address, User } from '@/types';
import {
    fetchAddAddress,
    fetchAuthSession,
    fetchDeleteAddress,
    fetchLogin,
    fetchLogout,
    fetchRegister,
    fetchUpdateAddress,
    fetchUpdateProfile,
} from './UserContext.api';
import { LoginResult, RegisterResult } from './UserContext.types';
import { tokenStore } from '@/lib/apiClient';

const UNKNOWN_REASON: LoginResult = { success: false, reason: 'unknown' };

interface UserActionsDependencies {
    setUser: Dispatch<SetStateAction<User | null>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const createUserActions = ({ setUser, setIsLoading }: UserActionsDependencies) => {
    const checkAuth = async () => {
        try {
            const response = await fetchAuthSession();

            if (!response.ok) {
                setUser(null);
                return;
            }

            const data = await response.json();
            if (data.success && data.data?.authenticated) {
                setUser(data.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<LoginResult> => {
        try {
            const response = await fetchLogin(email, password);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403 && typeof data?.message === 'string' && data.message.trim()) {
                    toast.error(data.message);
                    return { success: false, reason: 'account_disabled' };
                }

                if (response.status === 401) {
                    toast.error(data.message || 'Credenciales invalidas');
                    return { success: false, reason: 'invalid_credentials' };
                }

                toast.error(data.message || 'Error al iniciar sesion');
                return UNKNOWN_REASON;
            }

            if (data.success) {
                setUser(data.data.user);
                if (data.data.token) tokenStore.set(data.data.token);
                toast.success('Sesion iniciada correctamente');
                return { success: true, role: data.data.user.role };
            }

            return UNKNOWN_REASON;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrio un error inesperado';
            toast.error(message);
            console.error('Login error:', error);
            return UNKNOWN_REASON;
        }
    };

    const register = async (email: string, password: string, name: string, phone?: string): Promise<RegisterResult> => {
        try {
            const response = await fetchRegister(email, password, name, phone);
            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Error al registrarse');
                return { success: false };
            }

            if (data.success) {
                setUser(data.data.user);
                if (data.data.token) tokenStore.set(data.data.token);
                toast.success('Registro exitoso');
                return { success: true, welcomeCoupon: data.data.welcomeCoupon };
            }

            return { success: false };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrio un error inesperado';
            toast.error(message);
            console.error('Register error:', error);
            return { success: false };
        }
    };

    const logout = async () => {
        try {
            await fetchLogout();
        } catch (error) {
            console.error('Logout error:', error);
        }

        tokenStore.clear();
        setUser(null);
        toast.success('Sesion cerrada correctamente');
    };

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        try {
            const response = await fetchUpdateProfile(data);
            const result = await response.json();

            if (result.success) {
                setUser(result.data);
                toast.success('Perfil actualizado');
                return true;
            }

            toast.error(result.message || 'Error al actualizar perfil');
            return false;
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar perfil');
            return false;
        }
    };

    const addAddress = async (address: Omit<Address, 'id'>): Promise<boolean> => {
        try {
            const response = await fetchAddAddress(address);
            const result = await response.json();

            if (result.success) {
                await checkAuth();
                toast.success('Direccion agregada');
                return true;
            }

            toast.error(result.message || 'Error al agregar direccion');
            return false;
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Error al agregar direccion');
            return false;
        }
    };

    const updateAddress = async (id: string, address: Partial<Address>): Promise<boolean> => {
        try {
            const response = await fetchUpdateAddress(id, address);
            const result = await response.json();

            if (result.success) {
                await checkAuth();
                toast.success('Direccion actualizada');
                return true;
            }

            toast.error(result.message || 'Error al actualizar direccion');
            return false;
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Error al actualizar direccion');
            return false;
        }
    };

    const deleteAddress = async (id: string): Promise<boolean> => {
        try {
            const response = await fetchDeleteAddress(id);
            const result = await response.json();

            if (result.success) {
                await checkAuth();
                toast.success('Direccion eliminada');
                return true;
            }

            toast.error(result.message || 'Error al eliminar direccion');
            return false;
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Error al eliminar direccion');
            return false;
        }
    };

    return {
        checkAuth,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
    };
};
