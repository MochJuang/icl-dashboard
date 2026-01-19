import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowUpRight,
    ArrowDownLeft,
    RefreshCw,
    Search,
    Clock,
    ArrowRightLeft,
    Filter,
    ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { userApi, walletApi } from '../lib/api';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import type { TransferRecord, WalletInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const typeVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'primary'> = {
    TRANSFER: 'primary',
    MINT: 'success',
    STAKE: 'warning',
    UNSTAKE: 'default',
    REWARD: 'success',
    FEE: 'danger',
};

const typeLabels: Record<string, string> = {
    TRANSFER: 'Transfer',
    MINT: 'Mint',
    STAKE: 'Stake',
    UNSTAKE: 'Unstake',
    REWARD: 'Reward',
    FEE: 'Fee',
};

export default function TransactionHistory() {
    const { wallets } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    // Fetch all user transfers or specific wallet history
    const { data: transfersData, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['transfer-history', selectedWalletId],
        queryFn: () => selectedWalletId
            ? walletApi.getWalletHistory(selectedWalletId)
            : walletApi.getTransferHistory(),
    });

    const { data: profile } = useQuery({
        queryKey: ['users'],
        queryFn: () => userApi.getProfile(),
    });

    const transfers: TransferRecord[] = transfersData?.data?.transfers || transfersData?.transfers || [];
    const totalCount = transfersData?.data?.total_count || transfersData?.total_count || transfers.length;

    // Get unique transaction types from data
    const uniqueTypes = [...new Set(transfers.map(t => t.type))];

    // Filter transfers
    const filteredTransfers = transfers.filter(transfer => {
        // Type filter
        if (typeFilter && transfer.type !== typeFilter) return false;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                transfer.tx_id?.toLowerCase().includes(search) ||
                transfer.from_wallet_id?.toLowerCase().includes(search) ||
                transfer.to_wallet_id?.toLowerCase().includes(search) ||
                transfer.description?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    // Get selected wallet info
    const selectedWallet = wallets?.find((w: WalletInfo) => w.wallet_id === selectedWalletId);

    const TransactionRow = ({ transfer }: { transfer: TransferRecord }) => {
        const isIncoming = wallets?.some((w: WalletInfo) => w.wallet_id === transfer.to_wallet_id);
        const isOutgoing = wallets?.some((w: WalletInfo) => w.wallet_id === transfer.from_wallet_id);

        return (
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                    {/* Direction Icon */}
                    <div className={cn(
                        "p-2.5 rounded-xl",
                        isIncoming && !isOutgoing
                            ? "bg-green-100 text-green-600"
                            : isOutgoing && !isIncoming
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                    )}>
                        {isIncoming && !isOutgoing ? (
                            <ArrowDownLeft className="h-5 w-5" />
                        ) : isOutgoing && !isIncoming ? (
                            <ArrowUpRight className="h-5 w-5" />
                        ) : (
                            <ArrowRightLeft className="h-5 w-5" />
                        )}
                    </div>

                    {/* Transaction Info */}
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                                {transfer.type}
                            </p>
                            <Badge variant={typeVariants[transfer.type] || 'default'} className="text-xs">
                                {profile?.user_id == transfer.from_wallet_id ? 'DEBET' : 'KREDIT'}
                            </Badge>

                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span className="font-mono text-xs">
                                {(transfer.tx_id)}
                            </span>
                            <span>•</span>
                            <span>{formatDate(transfer.timestamp)}</span>
                        </div>
                    </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                    <p className={cn(
                        "font-bold text-lg",
                        isIncoming && !isOutgoing ? "text-green-600" : "text-gray-900"
                    )}>
                        {isIncoming && !isOutgoing ? '+' : ''}{formatCurrency(transfer.amount)} ICL
                    </p>
                    {transfer.from_balance_after !== undefined && (
                        <p className="text-xs text-gray-500">
                            Balance: {formatCurrency(transfer.from_balance_after || transfer.to_balance_after || 0)} ICL
                        </p>
                    )}
                </div>
            </div >
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transaction History</h1>
                    <p className="text-gray-500 mt-1">
                        {selectedWallet
                            ? `Showing transactions for wallet ${selectedWallet.wallet_address?.slice(0, 10)}...`
                            : 'View all your transaction history'
                        }
                    </p>
                </div>
                <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", isRefetching && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    <CardContent>
                        <p className="text-primary-100">Total Transactions</p>
                        <p className="text-3xl font-bold">{totalCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-gray-500">Incoming</p>
                        <p className="text-3xl font-bold text-green-600">
                            {transfers.filter(t => wallets?.some((w: WalletInfo) => w.wallet_id === t.to_wallet_id)).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-gray-500">Outgoing</p>
                        <p className="text-3xl font-bold text-red-600">
                            {transfers.filter(t => wallets?.some((w: WalletInfo) => w.wallet_id === t.from_wallet_id)).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by TX ID, wallet, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11"
                    />
                </div>

                {/* Wallet Filter */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            {selectedWallet ? `Wallet: ${selectedWallet.wallet_address?.slice(0, 8)}...` : 'All Wallets'}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[200px] z-50">
                            <DropdownMenu.Item
                                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded outline-none"
                                onClick={() => setSelectedWalletId(null)}
                            >
                                All Wallets
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                            {wallets?.map((wallet: WalletInfo) => (
                                <DropdownMenu.Item
                                    key={wallet.wallet_id}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded outline-none"
                                    onClick={() => setSelectedWalletId(wallet.wallet_id)}
                                >
                                    <div>
                                        <p className="font-mono text-xs">{wallet.wallet_address?.slice(0, 16)}...</p>
                                        <p className="text-gray-500 text-xs">{wallet.wallet_type}</p>
                                    </div>
                                </DropdownMenu.Item>
                            ))}
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                {/* Type Filter */}
                {uniqueTypes.length > 0 && (
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                {typeFilter ? typeLabels[typeFilter] || typeFilter : 'All Types'}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[150px] z-50">
                                <DropdownMenu.Item
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded outline-none"
                                    onClick={() => setTypeFilter(null)}
                                >
                                    All Types
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                                {uniqueTypes.map((type) => (
                                    <DropdownMenu.Item
                                        key={type}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 rounded outline-none"
                                        onClick={() => setTypeFilter(type)}
                                    >
                                        {typeLabels[type] || type}
                                    </DropdownMenu.Item>
                                ))}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                )}
            </div>

            {/* Transaction List */}
            <Card>
                {isLoading ? (
                    <CardContent className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                    </CardContent>
                ) : filteredTransfers.length === 0 ? (
                    <CardContent className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
                        <p className="text-gray-500">
                            {searchTerm || typeFilter
                                ? 'Try adjusting your search or filters'
                                : 'Your transaction history will appear here'
                            }
                        </p>
                    </CardContent>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredTransfers.map((transfer) => (
                            <TransactionRow key={transfer.tx_id} transfer={transfer} />
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

