'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { User, Address } from '../types';

interface UserContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; welcomeCoupon?: any }>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
    addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
    updateAddress: (id: string, address: Partial<Address>) => Promise<boolean>;
    deleteAddress: (id: string) => Promise<boolean>;
    refreshUser: () => Promise<void>;
}

const API_URL = 'http://localhost:5001/api';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                credentials: 'include',
            });

            if (!response.ok) {
                setUser(null);
                return;
            }

            const data = await response.json();
            if (data.success) {
                setUser(data.data);
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

    React.useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Error al iniciar sesión');
                return { success: false };
            }

            if (data.success) {
                setUser(data.data.user);
                toast.success('Sesión iniciada correctamente');
                return { success: true, role: data.data.user.role };
            }
            return { success: false };
        } catch (error: any) {
            toast.error(error.message || 'Ocurrió un error inesperado');
            console.error('Login error:', error);
            return { success: false };
        }
    };

    const register = async (email: string, password: string, name: string, phone?: string): Promise<{ success: boolean; welcomeCoupon?: any }> => {
        try {
            const trimmedEmail = email.trim();
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail, password, name, phone }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Error al registrarse');
                return { success: false };
            }

            if (data.success) {
                setUser(data.data.user);
                toast.success('Registro exitoso');
                return { success: true, welcomeCoupon: data.data.welcomeCoupon };
            }
            return { success: false };
        } catch (error: any) {
            toast.error(error.message || 'Ocurrió un error inesperado');
            console.error('Register error:', error);
            return { success: false };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        toast.success('Sesión cerrada correctamente');
    };

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (resData.success) {
                setUser(resData.data);
                toast.success('Perfil actualizado');
                return true;
            } else {
                toast.error(resData.message || 'Error al actualizar perfil');
                return false;
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar perfil');
            return false;
        }
    };

    const addAddress = async (address: Omit<Address, 'id'>): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/users/address`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address),
            });

            const resData = await response.json();

            if (resData.success) {
                checkAuth();
                toast.success('Dirección agregada');
                return true;
            } else {
                toast.error(resData.message || 'Error al agregar dirección');
                return false;
            }
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Error al agregar dirección');
            return false;
        }
    };

    const updateAddress = async (id: string, address: Partial<Address>): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/users/address/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address),
            });

            const resData = await response.json();

            if (resData.success) {
                checkAuth();
                toast.success('Dirección actualizada');
                return true;
            } else {
                toast.error(resData.message || 'Error al actualizar dirección');
                return false;
            }
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Error al actualizar dirección');
            return false;
        }
    };

    const deleteAddress = async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/users/address/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const resData = await response.json();

            if (resData.success) {
                checkAuth();
                toast.success('Dirección eliminada');
                return true;
            } else {
                toast.error(resData.message || 'Error al eliminar dirección');
                return false;
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Error al eliminar dirección');
            return false;
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            register,
            logout,
            isAuthenticated: !!user,
            updateProfile,
            addAddress,
            updateAddress,
            deleteAddress,
            refreshUser: checkAuth
        }}>
            {!isLoading && children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
