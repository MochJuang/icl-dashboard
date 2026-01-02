import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Wallet, RefreshCw, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { WalletCard, TransferModal, CreateWalletModal } from '../components/wallet';
import { walletApi } from '../lib/api';
import type { Wallet as WalletType } from '../types';

export default function Wallets() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: walletsData, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['wallets'],
        queryFn: walletApi.getWallets,
    });

    const wallets: WalletType[] = walletsData?.data?.wallets || [];

    const filteredWallets = wallets.filter((wallet) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            wallet.wallet_type.toLowerCase().includes(searchLower) ||
            wallet.wallet_id.toLowerCase().includes(searchLower) ||
            wallet.wallet_address?.toLowerCase().includes(searchLower)
        );
    });

    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

    const handleTransfer = (wallet: WalletType) => {
        setSelectedWallet(wallet);
        setIsTransferOpen(true);
    };

    const handleView = (wallet: WalletType) => {
        // Navigate to wallet detail page
        console.log('View wallet:', wallet.wallet_id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wallets</h1>
                    <p className="text-gray-500 mt-2">Manage your blockchain wallets</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Wallet
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Wallet className="h-6 w-6" />
                        <span className="text-blue-100">Total Balance</span>
                    </div>
                    <p className="text-3xl font-bold">
                        {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalBalance)}
                    </p>
                    <p className="text-blue-100 text-sm">ICL Coins</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-100">
                            <Wallet className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-gray-500">Total Wallets</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{wallets.length}</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-green-100">
                            <Wallet className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-gray-500">Active Wallets</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {wallets.filter((w) => w.status === 'ACTIVE').length}
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search wallets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Wallet Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredWallets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No wallets found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm ? 'Try a different search term' : 'Create your first wallet to get started'}
                    </p>
                    {!searchTerm && (
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Wallet
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
