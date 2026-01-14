import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, LogOut, User, Wallet, Check, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatCurrency, shortenAddress } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { WALLET_TYPE_LABELS, WALLET_TYPE_COLORS } from '../../lib/constants';
import type { WalletInfo } from '../../types';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const navigate = useNavigate();
    const { user, wallets, activeWallet, setActiveWallet, logout } = useAuth();
    const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const walletDropdownRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
                setIsWalletDropdownOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleWalletSelect = (wallet: WalletInfo) => {
        setActiveWallet(wallet);
        setIsWalletDropdownOpen(false);
    };

    // Group wallets by type
    const groupedWallets = wallets.reduce((acc, wallet) => {
        const type = wallet.wallet_type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(wallet);
        return acc;
    }, {} as Record<string, WalletInfo[]>);

    return (
        <header className="sticky top-0 z-30 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <div className="flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
                {/* Left side - Menu button (mobile) & Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100/80 active:bg-gray-200/80 transition-all"
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Page title area - can be dynamic based on route/breadcrumbs in future */}
                    <div className="hidden md:flex flex-col">
                        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                            Overview
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">Welcome back, {user?.full_name?.split(' ')[0]}</p>
                    </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-3 md:gap-6">
                    {/* Search - Desktop only (placeholder for now) */}
                    <div className="hidden lg:flex relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-gray-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm w-48 focus:w-64 focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all duration-300 placeholder-gray-400"
                        />
                    </div>

                    <div className="h-8 w-px bg-gray-200 hidden md:block" />

                    {/* Wallet Selector */}
                    <div className="relative" ref={walletDropdownRef}>
                        <button
                            onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all duration-300 group',
                                isWalletDropdownOpen
                                    ? 'border-primary-500/30 bg-primary-50/50 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                                isWalletDropdownOpen ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            )}>
                                <Wallet className="h-4 w-4" />
                            </div>

                            <div className="hidden sm:block text-left mr-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-tight">
                                    {activeWallet ? WALLET_TYPE_LABELS[activeWallet.wallet_type] : 'Select'}
                                </p>
                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                    {activeWallet ? formatCurrency(activeWallet.balance) : '---'} <span className="text-xs font-normal text-gray-500">ICL</span>
                                </p>
                            </div>


                            <ChevronDown className={cn(
                                'h-4 w-4 text-gray-400 transition-transform duration-300',
                                isWalletDropdownOpen && 'rotate-180 text-primary-500'
                            )} />
                        </button>

                        {/* Wallet Dropdown */}
                        {isWalletDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-5 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-900">Switch Wallet</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Select a wallet to operate with</p>
                                </div>

                                <div className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 p-2">
                                    {Object.entries(groupedWallets).map(([type, typeWallets]) => (
                                        <div key={type} className="mb-3 last:mb-0">
                                            <div className="px-3 py-2">
                                                <span className={cn(
                                                    'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border',
                                                    WALLET_TYPE_COLORS[type] || 'bg-gray-100 border-gray-200 text-gray-600'
                                                )}>
                                                    {WALLET_TYPE_LABELS[type] || type}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {typeWallets.map((wallet) => (
                                                    <button
                                                        key={wallet.wallet_id}
                                                        onClick={() => handleWalletSelect(wallet)}
                                                        className={cn(
                                                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                                                            activeWallet?.wallet_id === wallet.wallet_id
                                                                ? 'bg-primary-50 text-primary-900'
                                                                : 'hover:bg-gray-50 text-gray-700'
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-mono border",
                                                            activeWallet?.wallet_id === wallet.wallet_id
                                                                ? "bg-white border-primary-200 text-primary-600 shadow-sm"
                                                                : "bg-gray-50 border-gray-200 text-gray-500 group-hover:bg-white group-hover:shadow-sm"
                                                        )}>
                                                            {shortenAddress(wallet.wallet_address, 2).substring(0, 2)}
                                                        </div>
                                                        <div className="flex-1 text-left min-w-0">
                                                            <p className={cn(
                                                                "text-sm font-medium truncate",
                                                                activeWallet?.wallet_id === wallet.wallet_id ? "text-primary-900" : "text-gray-900"
                                                            )}>
                                                                {shortenAddress(wallet.wallet_address, 8)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate font-mono">
                                                                {formatCurrency(wallet.balance)} ICL
                                                            </p>
                                                        </div>
                                                        {activeWallet?.wallet_id === wallet.wallet_id && (
                                                            <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center shadow-sm shadow-primary-500/30">
                                                                <Check className="h-3.5 w-3.5 text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <button className="hidden md:flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                    </button>

                    {/* User Menu */}
                    <div className="relative" ref={userDropdownRef}>
                        <button
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            className={cn(
                                'flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-all duration-300 border border-transparent',
                                isUserDropdownOpen ? 'bg-gray-100 border-gray-200' : 'hover:bg-gray-50 hover:border-gray-200'
                            )}
                        >
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white ring-2 ring-white">
                                <span className="text-sm font-semibold">
                                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <ChevronDown className={cn(
                                'hidden sm:block h-4 w-4 text-gray-400 transition-transform duration-300',
                                isUserDropdownOpen && 'rotate-180'
                            )} />
                        </button>

                        {/* User Dropdown */}
                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {user?.full_name || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                                    <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-semibold tracking-wide uppercase border border-green-100">
                                        Verified Account
                                    </div>
                                </div>

                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            setIsUserDropdownOpen(false);
                                            navigate('/settings');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        <User className="h-4 w-4 text-gray-400" />
                                        Profile Settings
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 p-2 mt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
