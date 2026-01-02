import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { walletApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import type { Wallet as WalletType } from '../types';

export default function Treasury() {
    const { data: walletsData, isLoading } = useQuery({
        queryKey: ['wallets'],
        queryFn: walletApi.getWallets,
    });

    const wallets: WalletType[] = walletsData?.data?.wallets || [];
    const ownerWallet = wallets.find((w) => w.wallet_type === 'OWNER');
    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const totalStaked = wallets.reduce((sum, w) => sum + (w.staked_amount || 0), 0);

    const stats = [
        {
            title: 'Owner Wallet Balance',
            value: formatCurrency(ownerWallet?.balance || 0),
            icon: Wallet,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
        },
        {
            title: 'Total Network Balance',
            value: formatCurrency(totalBalance),
            icon: Building2,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Total Staked',
            value: formatCurrency(totalStaked),
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Treasury Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of network funds and distributions</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value} ICL</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Wallet Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Wallet Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {wallets.map((wallet) => (
                            <div
                                key={wallet.wallet_id}
                                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${wallet.wallet_type === 'OWNER' ? 'bg-amber-100' :
                                        wallet.wallet_type === 'NODE' ? 'bg-purple-100' :
                                            wallet.wallet_type === 'DEVELOPER' ? 'bg-green-100' :
                                                'bg-blue-100'
                                        }`}>
                                        <Wallet className={`h-5 w-5 ${wallet.wallet_type === 'OWNER' ? 'text-amber-600' :
                                            wallet.wallet_type === 'NODE' ? 'text-purple-600' :
                                                wallet.wallet_type === 'DEVELOPER' ? 'text-green-600' :
                                                    'text-blue-600'
                                            }`} />
                                    </div>
                                    <div>
                                        <p className="font-medium">{wallet.wallet_type} Wallet</p>
                                        <p className="text-sm text-gray-500">
                                            {wallet.wallet_address?.slice(0, 12)}...{wallet.wallet_address?.slice(-6)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{formatCurrency(wallet.balance)} ICL</p>
                                    {wallet.staked_amount > 0 && (
                                        <p className="text-sm text-purple-600">
                                            Staked: {formatCurrency(wallet.staked_amount)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Distributions Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Fee Distributions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Fee distribution history will be displayed here</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
