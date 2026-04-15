'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { User, Address } from '../types';

interface UserContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>;
    register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; welcomeCoupon?: any }>;
    logout: () => void;
    isAuthenticated: boolean;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
    addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
    updateAddress: (id: string, address: Partial<Address>) => Promise<boolean>;
    deleteAddress: (id: string) => Promise<boolean>;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data);
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            localStorage.removeItem('token');
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
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Error al iniciar sesión');
                return { success: false };
            }

            if (data.success) {
                localStorage.setItem('token', data.data.token);
                document.cookie = `token=${data.data.token}; path=/; max-age=86400; SameSite=Strict`;
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
            const response = await fetch('http://localhost:5001/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: trimmedEmail, password, name, phone }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || 'Error al registrarse');
                return { success: false };
            }

            if (data.success) {
                localStorage.setItem('token', data.data.token);
                document.cookie = `token=${data.data.token}; path=/; max-age=86400; SameSite=Strict`;
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

    const logout = () => {
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setUser(null);
        toast.success('Sesión cerrada correctamente');
    };

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const response = await fetch('http://localhost:5001/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const response = await fetch('http://localhost:5001/api/users/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(address),
            });

            const resData = await response.json();

            if (resData.success) {
                // Refresh profile to get updated addresses
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
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const response = await fetch(`http://localhost:5001/api/users/address/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(address),
            });

            const resData = await response.json();

            if (resData.success) {
                // Refresh profile to get updated addresses
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
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const response = await fetch(`http://localhost:5001/api/users/address/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            const resData = await response.json();

            if (resData.success) {
                // Refresh profile to get updated addresses
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
