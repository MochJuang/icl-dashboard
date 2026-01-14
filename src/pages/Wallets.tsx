import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Wallet, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { WalletCard, TransferModal, CreateWalletModal } from '../components/wallet';
import { walletApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { WALLET_TYPE_LABELS } from '../lib/constants';
import { cn } from '../lib/utils';
import type { Wallet as WalletType, WalletType as WalletTypeEnum } from '../types';

const walletTypeFilters: (WalletTypeEnum | 'ALL')[] = ['ALL', 'REGULAR', 'NODE_WALLET', 'OWNER', 'DEVELOPER'];

export default function Wallets() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<WalletTypeEnum | 'ALL'>('ALL');
    const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: walletsData, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['wallets'],
        queryFn: walletApi.getWallets,
    });

    const wallets: WalletType[] = walletsData?.data || [];

    // Filter wallets
    const filteredWallets = useMemo(() => {
        return wallets.filter((wallet) => {
            const walletType = wallet.type || wallet.wallet_type || 'REGULAR';

            // Type filter
            if (typeFilter !== 'ALL' && walletType !== typeFilter) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    walletType.toLowerCase().includes(searchLower) ||
                    wallet.wallet_id.toLowerCase().includes(searchLower) ||
                    wallet.wallet_address?.toLowerCase().includes(searchLower)
                );
            }

            return true;
        });
    }, [wallets, typeFilter, searchTerm]);

    // Calculate totals
    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const totalLocked = wallets.reduce((sum, w) => sum + (w.locked_balance || 0), 0);
    const activeCount = wallets.filter((w) => w.status === 'ACTIVE').length;

    const handleTransfer = (wallet: WalletType) => {
        setSelectedWallet(wallet);
        setIsTransferOpen(true);
    };

    const handleView = (wallet: WalletType) => {
        // console.log('View wallet:', wallet.wallet_id);
        return wallet;
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Wallets</h1>
                    <p className="text-gray-500 font-medium">Manage your blockchain wallets and assets</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
                <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/20 h-full">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
                    <CardContent className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <span className="text-blue-100 font-medium">Total Balance</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold tracking-tight">
                                {formatCurrency(totalBalance)}
                            </p>
                            <p className="text-blue-100 text-sm mt-1 opacity-80">All wallets combined</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg shadow-gray-200/50 h-full">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <span className="text-gray-600 font-medium">Locked Balance</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalLocked)}</p>
                            <p className="text-gray-500 text-sm mt-1">Currently in stake</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg shadow-gray-200/50 h-full">
                    <CardContent>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <span className="text-gray-600 font-medium">Active Wallets</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{activeCount}</p>
                            <p className="text-gray-500 text-sm mt-1">out of {wallets.length} total wallets</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-4 sticky top-16 z-30 bg-gray-50/90 backdrop-blur-md py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-xl sm:bg-transparent sm:backdrop-blur-none transition-all mb-6">
                {/* Search */}
                <div className="relative flex-1 lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                        placeholder="Search by address or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 h-11 bg-white border-gray-200 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 rounded-xl shadow-sm hover:border-gray-300 transition-all"
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 flex-1 items-start sm:items-center justify-between">
                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        {walletTypeFilters.map((type) => {
                            const count = wallets.filter(w => (w.type || w.wallet_type) === type).length;
                            const isSelected = typeFilter === type;

                            return (
                                <button
                                    key={type}
                                    onClick={() => setTypeFilter(type)}
                                    className={cn(
                                        'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border',
                                        isSelected
                                            ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{type === 'ALL' ? 'All Wallets' : WALLET_TYPE_LABELS[type] || type}</span>
                                        {type !== 'ALL' && count > 0 && (
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                                isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                            )}>
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="shrink-0 bg-white border-dashed border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400 rounded-xl h-10 px-4"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Wallet Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-4" />
                    <p className="text-gray-500 font-medium">Loading your wallets...</p>
                </div>
            ) : filteredWallets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="p-4 rounded-full bg-gray-50 mb-4">
                        <Wallet className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No wallets found</h3>
                    <p className="text-gray-500 mb-6 text-center max-w-sm mx-auto">
                        {searchTerm || typeFilter !== 'ALL'
                            ? 'We couldn\'t find any wallets matching your current filters. Try adjusting them.'
                            : 'Get started by creating your first blockchain wallet to manage your assets.'}
                    </p>
                    {(!searchTerm && typeFilter === 'ALL') && (
                        <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary-500/20">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Calculator
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredWallets.map((wallet) => (
                        <WalletCard
                            key={wallet.wallet_id}
                            wallet={wallet}
                            onTransfer={handleTransfer}
                            onView={handleView}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <TransferModal
                wallet={selectedWallet}
                isOpen={isTransferOpen}
                onClose={() => {
                    setIsTransferOpen(false);
                    setSelectedWallet(null);
                }}
            />

            <CreateWalletModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
