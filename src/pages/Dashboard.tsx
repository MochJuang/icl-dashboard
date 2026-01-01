import { useQuery } from '@tanstack/react-query';
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { walletApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { WALLET_TYPE_LABELS } from '../lib/constants';

export default function Dashboard() {
    const { user } = useAuth();

    const { data: walletsData, isLoading } = useQuery({
        queryKey: ['wallets'],
        queryFn: walletApi.getWallets,
    });

    const wallets = walletsData?.data?.wallets || [];
    const totalBalance = wallets.reduce((sum: number, w: { balance: number }) => sum + w.balance, 0);

    const stats = [
        {
            title: 'Total Balance',
            value: formatCurrency(totalBalance),
            icon: Wallet,
            color: 'text-primary-500',
            bgColor: 'bg-primary-100',
        },
        {
            title: 'Wallets',
            value: wallets.length.toString(),
            icon: Users,
            color: 'text-success-500',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Incoming',
            value: formatCurrency(0),
            icon: ArrowDownLeft,
            color: 'text-green-500',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Outgoing',
            value: formatCurrency(0),
            icon: ArrowUpRight,
            color: 'text-danger-500',
            bgColor: 'bg-red-100',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-gray-500">Here's an overview of your blockchain activity</p>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Wallets overview */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Wallets</CardTitle>
                    <Badge variant="primary">{wallets.length} wallets</Badge>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : wallets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Wallet className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No wallets found. Create your first wallet to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {wallets.slice(0, 5).map((wallet: { wallet_id: string; wallet_type: string; balance: number; status: string }) => (
                                <div
                                    key={wallet.wallet_id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary-100">
                                            <Wallet className="h-5 w-5 text-primary-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{WALLET_TYPE_LABELS[wallet.wallet_type]} Wallet</p>
                                            <p className="text-sm text-gray-500">
                                                {wallet.wallet_id.slice(0, 8)}...{wallet.wallet_id.slice(-6)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{formatCurrency(wallet.balance)}</p>
                                        <Badge variant={wallet.status === 'ACTIVE' ? 'success' : 'warning'}>
                                            {wallet.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:border-primary-500 transition-colors">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="p-3 rounded-lg bg-primary-100">
                            <TrendingUp className="h-6 w-6 text-primary-500" />
                        </div>
                        <div>
                            <p className="font-medium">Transfer Coins</p>
                            <p className="text-sm text-gray-500">Send coins to another wallet</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
