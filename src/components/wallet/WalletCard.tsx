import React from 'react';
import { Wallet, Send, Eye, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency, shortenAddress } from '../../lib/utils';
import { WALLET_TYPE_LABELS } from '../../lib/constants';
import type { Wallet as WalletType } from '../../types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface WalletCardProps {
    wallet: WalletType;
    onTransfer?: (wallet: WalletType) => void;
    onView?: (wallet: WalletType) => void;
}

const walletColors: Record<string, { bg: string; icon: string }> = {
    REGULAR: { bg: 'bg-blue-100', icon: 'text-blue-600' },
    NODE: { bg: 'bg-purple-100', icon: 'text-purple-600' },
    DEVELOPER: { bg: 'bg-green-100', icon: 'text-green-600' },
    OWNER: { bg: 'bg-amber-100', icon: 'text-amber-600' },
};

export function WalletCard({ wallet, onTransfer, onView }: WalletCardProps) {
    const colors = walletColors[wallet.wallet_type] || walletColors.REGULAR;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${colors.bg}`}>
                            <Wallet className={`h-6 w-6 ${colors.icon}`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {WALLET_TYPE_LABELS[wallet.wallet_type]} Wallet
                            </h3>
                            <p className="text-sm text-gray-500">
                                {shortenAddress(wallet.wallet_address || wallet.wallet_id)}
                            </p>
                        </div>
                    </div>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                className="min-w-[150px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                sideOffset={5}
                                align="end"
                            >
                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:bg-gray-100"
                                    onClick={() => onView?.(wallet)}
                                >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                </DropdownMenu.Item>
                                {wallet.wallet_type === 'REGULAR' && (
                                    <DropdownMenu.Item
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:bg-gray-100"
                                        onClick={() => onTransfer?.(wallet)}
                                    >
                                        <Send className="h-4 w-4" />
                                        Transfer
                                    </DropdownMenu.Item>
                                )}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(wallet.balance)} <span className="text-sm font-normal text-gray-500">ICL</span>
                        </p>
                    </div>

                    {wallet.staked_amount > 0 && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-500">Staked</span>
                            <span className="font-medium text-purple-600">
                                {formatCurrency(wallet.staked_amount)} ICL
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Status</span>
                        <Badge variant={wallet.status === 'ACTIVE' ? 'success' : 'warning'}>
                            {wallet.status}
                        </Badge>
                    </div>
                </div>

                {wallet.wallet_type === 'REGULAR' && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => onTransfer?.(wallet)}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Transfer
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
