import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, WalletInfo, WalletType, LoginResponseData } from '../types/index';

interface AuthContextType {
    // User data
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Wallet data
    wallets: WalletInfo[];
    activeWallet: WalletInfo | null;
    roles: string[];

    // Wallet helpers
    hasRole: (role: string) => boolean;
    hasWalletType: (type: WalletType) => boolean;
    getWalletsByType: (type: WalletType) => WalletInfo[];
    getNodeWallets: () => WalletInfo[];
    setActiveWallet: (wallet: WalletInfo) => void;

    // Auth actions
    login: (data: LoginResponseData) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    updateWallets: (wallets: WalletInfo[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [wallets, setWallets] = useState<WalletInfo[]>([]);
    const [activeWallet, setActiveWalletState] = useState<WalletInfo | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedWallets = localStorage.getItem('wallets');
        const storedActiveWallet = localStorage.getItem('activeWallet');
        const storedRoles = localStorage.getItem('roles');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                if (storedWallets) {
                    const parsedWallets = JSON.parse(storedWallets);
                    setWallets(parsedWallets);
                }

                if (storedActiveWallet) {
                    setActiveWalletState(JSON.parse(storedActiveWallet));
                }

                if (storedRoles) {
                    setRoles(JSON.parse(storedRoles));
                }
            } catch {
                // Invalid stored data, clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('wallets');
                localStorage.removeItem('activeWallet');
                localStorage.removeItem('roles');
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((data: LoginResponseData) => {
        const { token: newToken, user_id, email, wallets: userWallets, roles: userRoles, active_wallet_id } = data;

        const newUser: User = {
            user_id,
            email,
            full_name: '', // Will be fetched from profile
            kyc_status: 'PENDING',
        };

        // Find active wallet or use first wallet
        const activeWalletFromResponse = userWallets.find(w => w.wallet_id === active_wallet_id) || userWallets[0] || null;

        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('wallets', JSON.stringify(userWallets));
        localStorage.setItem('roles', JSON.stringify(userRoles));
        if (activeWalletFromResponse) {
            localStorage.setItem('activeWallet', JSON.stringify(activeWalletFromResponse));
        }

        // Update state
        setToken(newToken);
        setUser(newUser);
        setWallets(userWallets);
        setRoles(userRoles);
        setActiveWalletState(activeWalletFromResponse);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('wallets');
        localStorage.removeItem('activeWallet');
        localStorage.removeItem('roles');
        setToken(null);
        setUser(null);
        setWallets([]);
        setActiveWalletState(null);
        setRoles([]);
    }, []);

    const updateUser = useCallback((updatedUser: User) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    }, []);

    const updateWallets = useCallback((updatedWallets: WalletInfo[]) => {
        localStorage.setItem('wallets', JSON.stringify(updatedWallets));
        setWallets(updatedWallets);

        // Update active wallet if it was updated
        if (activeWallet) {
            const updated = updatedWallets.find(w => w.wallet_id === activeWallet.wallet_id);
            if (updated) {
                localStorage.setItem('activeWallet', JSON.stringify(updated));
                setActiveWalletState(updated);
            }
        }
    }, [activeWallet]);

    const setActiveWallet = useCallback((wallet: WalletInfo) => {
        localStorage.setItem('activeWallet', JSON.stringify(wallet));
        setActiveWalletState(wallet);
    }, []);

    // Helper functions
    const hasRole = useCallback((role: string): boolean => {
        return roles.includes(role);
    }, [roles]);

    const hasWalletType = useCallback((type: WalletType): boolean => {
        return wallets.some(w => w.wallet_type === type);
    }, [wallets]);

    const getWalletsByType = useCallback((type: WalletType): WalletInfo[] => {
        return wallets.filter(w => w.wallet_type === type);
    }, [wallets]);

    const getNodeWallets = useCallback((): WalletInfo[] => {
        return wallets.filter(w => w.wallet_type === 'NODE_WALLET');
    }, [wallets]);

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        wallets,
        activeWallet,
        roles,
        hasRole,
        hasWalletType,
        getWalletsByType,
        getNodeWallets,
        setActiveWallet,
        login,
        logout,
        updateUser,
        updateWallets,
    }), [
        user,
        token,
        isLoading,
        wallets,
        activeWallet,
        roles,
        hasRole,
        hasWalletType,
        getWalletsByType,
        getNodeWallets,
        setActiveWallet,
        login,
        logout,
        updateUser,
        updateWallets,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
