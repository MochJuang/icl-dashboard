import { useQuery } from '@tanstack/react-query';
import { Building2, Wallet, TrendingUp, Landmark, PieChart, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { walletApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { WALLET_TYPE_LABELS, WALLET_TYPE_COLORS } from '../lib/constants';
import type { Wallet as WalletType } from '../types';
import { cn } from '../lib/utils';

export default function Treasury() {
    const { data: walletsData, isLoading } = useQuery({
        queryKey: ['wallets'],
        queryFn: walletApi.getWallets,
    });

    const wallets: WalletType[] = walletsData?.data || [];
    const ownerWallet = wallets.find((w) => w.type === 'OWNER' || w.wallet_type === 'OWNER');

    // Calculate network statistics
    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const totalLocked = wallets.reduce((sum, w) => sum + (w.locked_balance || 0), 0);
    const circulatingSupply = totalBalance - (ownerWallet?.balance || 0);

    const stats = [
        {
            title: 'Owner Reserve',
            value: formatCurrency(ownerWallet?.balance || 0),
            subtitle: 'Funds in Owner Wallet',
            icon: Landmark,
            gradient: 'from-amber-500 to-orange-600',
            shadow: 'shadow-amber-500/20',
        },
        {
            title: 'Network TVL',
            value: formatCurrency(totalBalance + totalLocked),
            subtitle: 'Total Value Locked + Circulating',
            icon: Building2,
            gradient: 'from-blue-600 to-indigo-600',
            shadow: 'shadow-blue-500/20',
        },
        {
            title: 'Total Staked',
            value: formatCurrency(totalLocked),
            subtitle: 'Locked in Validator Nodes',
            icon: TrendingUp,
            gradient: 'from-purple-600 to-violet-600',
            shadow: 'shadow-purple-500/20',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Loading treasury data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Treasury Dashboard</h1>
                    <p className="text-gray-500 font-medium">Overview of network funds, distribution, and stability</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span>Network Status: Stable</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.title} className="relative group p-6 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                        <div className={`absolute top-0 right-0 p-16 rounded-bl-full bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow} text-white`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                        </div>

                        <div className="relative z-10">
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value} <span className="text-sm font-medium text-gray-400">ICL</span></p>
                            <p className="text-sm text-gray-400 mt-1 font-medium">{stat.subtitle}</p>
                        </div>

                        {/* Decorative line */}
                        <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Wallet Distribution */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-gray-400" />
                                Network Wallets
                            </CardTitle>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                {wallets.length} Total
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {wallets.map((wallet) => {
                                const type = wallet.type || wallet.wallet_type || 'REGULAR';
                                const colorClass = WALLET_TYPE_COLORS[type] || 'bg-gray-100 text-gray-600';

                                return (
                                    <div
                                        key={wallet.wallet_id}
                                        className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <div className={cn("h-2.5 w-2.5 rounded-full",
                                                    type === 'OWNER' ? 'bg-amber-500' :
                                                        type === 'NODE_WALLET' ? 'bg-purple-500' :
                                                            type === 'DEVELOPER' ? 'bg-emerald-500' : 'bg-blue-500'
                                                )} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded", colorClass)}>
                                                        {WALLET_TYPE_LABELS[type]}
                                                    </span>
                                                    {type === 'OWNER' && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Admin</span>}
                                                </div>
                                                <p className="text-xs font-mono text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">
                                                    {wallet.wallet_address}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{formatCurrency(wallet.balance)}</p>
                                            {wallet.locked_balance > 0 && (
                                                <p className="text-xs font-medium text-purple-600 flex items-center justify-end gap-1 mt-0.5">
                                                    <TrendingUp className="h-3 w-3" />
                                                    {formatCurrency(wallet.locked_balance)} Locked
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution Chart Placeholder / Info */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-blue-400" />
                                Token Supply
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-300">Circulating Supply</span>
                                    <span className="font-bold">{formatCurrency(circulatingSupply)}</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${(circulatingSupply / (totalBalance + totalLocked)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-300">Owner Reserve</span>
                                    <span className="font-bold">{formatCurrency(ownerWallet?.balance || 0)}</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full"
                                        style={{ width: `${((ownerWallet?.balance || 0) / (totalBalance + totalLocked)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-300">Staked (Locked)</span>
                                    <span className="font-bold">{formatCurrency(totalLocked)}</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full"
                                        style={{ width: `${(totalLocked / (totalBalance + totalLocked)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-blue-50/50 border-blue-100">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6">
                                <div className="bg-white p-3 rounded-full shadow-sm inline-flex mb-3">
                                    <Activity className="h-6 w-6 text-blue-400" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">No recent treasury transactions</p>
                                <p className="text-xs text-gray-400 mt-1">Fee distributions will appear here</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
