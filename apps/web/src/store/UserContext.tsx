'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { createUserActions } from './user-context/UserContext.hooks';
import { LoginResult, UserContextType, UserProviderProps } from './user-context/UserContext.types';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const actions = createUserActions({ setUser, setIsLoading });

    useEffect(() => {
        actions.checkAuth();
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                login: actions.login,
                register: actions.register,
                logout: actions.logout,
                isAuthenticated: !!user,
                updateProfile: actions.updateProfile,
                addAddress: actions.addAddress,
                updateAddress: actions.updateAddress,
                deleteAddress: actions.deleteAddress,
                refreshUser: actions.checkAuth,
            }}
        >
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
