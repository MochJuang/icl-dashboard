import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Wallet,
    ArrowUpRight,
    TrendingUp,
    Server,
    Vote,
    RefreshCw,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { walletApi, nodeApi, governanceApi } from '../lib/api';
import { formatCurrency, shortenAddress, formatDateShort } from '../lib/utils';
import { WALLET_TYPE_LABELS, WALLET_TYPE_COLORS } from '../lib/constants';
import type { Wallet as WalletType, Node, Vote as VoteType } from '../types';

export default function Dashboard() {
    const { user, hasWalletType } = useAuth();

    const { data: walletsData, isLoading: loadingWallets, refetch: refetchWallets, isRefetching } = useQuery({
        queryKey: ['wallets'],
        queryFn: walletApi.getWallets,
    });

    const { data: nodesData } = useQuery({
        queryKey: ['my-nodes'],
        queryFn: nodeApi.getMyNodes,
        enabled: hasWalletType('NODE_WALLET'),
    });

    const { data: votesData } = useQuery({
        queryKey: ['active-votes'],
        queryFn: governanceApi.getActiveVotes,
        enabled: hasWalletType('NODE_WALLET'),
    });

    const wallets: WalletType[] = walletsData?.data || [];
    const nodes: Node[] = nodesData?.data || [];
    const votes: VoteType[] = votesData?.data || [];

    const totalBalance = wallets.reduce((sum: number, w) => sum + (w.balance || 0), 0);
    const totalLocked = wallets.reduce((sum: number, w) => sum + (w.locked_balance || 0), 0);

    const stats = [
        {
            title: 'Total Balance',
            value: formatCurrency(totalBalance),
            subtitle: 'Available ICL',
            icon: Wallet,
            gradient: 'from-blue-500 to-blue-600',
            shadow: 'shadow-blue-500/20',
        },
        {
            title: 'Locked Balance',
            value: formatCurrency(totalLocked),
            subtitle: 'In stake',
            icon: TrendingUp,
            gradient: 'from-purple-500 to-purple-600',
            shadow: 'shadow-purple-500/20',
        },
        {
            title: 'Active Nodes',
            value: nodes.filter(n => n.status === 'ACTIVE').length.toString(),
            subtitle: `of ${nodes.length} total`,
            icon: Server,
            gradient: 'from-green-500 to-green-600',
            shadow: 'shadow-green-500/20',
            show: hasWalletType('NODE_WALLET'),
        },
        {
            title: 'Pending Votes',
            value: votes.filter(v => v.status === 'PENDING').length.toString(),
            subtitle: 'Need your vote',
            icon: Vote,
            gradient: 'from-amber-500 to-amber-600',
            shadow: 'shadow-amber-500/20',
            show: hasWalletType('NODE_WALLET'),
        },
    ].filter(stat => stat.show !== false);

    return (
        <div className="animate-fade-in">
            {/* Welcome header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Welcome back, <span className="text-primary-600">{user?.full_name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Here's what's happening happening with your assets today.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetchWallets()}
                    disabled={isRefetching}
                    className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            {/* Stats grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.title} className="relative group p-6 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-between">
                        <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl rounded-tr-2xl bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow} text-white`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            {stat.title === 'Pending Votes' && parseInt(stat.value) > 0 && (
                                <span className="flex h-3 w-3 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            )}
                        </div>

                        <div>
                            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">{stat.title}</p>
                        </div>

                        {/* Decorative bottom line */}
                        <div className={`absolute bottom-0 left-6 right-6 h-1 rounded-t-full bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    </div>
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-3 items-start">
                {/* Wallets overview */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                        <div>
                            <CardTitle className="text-xl font-bold">My Wallets</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">Manage contributions & assets</p>
                        </div>
                        <Link to="/wallets">
                            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 hover:bg-primary-50">
                                View All Wallets
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loadingWallets ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                            </div>
                        ) : wallets.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No wallets found</p>
                                <Button variant="link" className="text-primary-500 mt-2">Create your first wallet</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {wallets.slice(0, 4).map((wallet) => {
                                    const walletType = wallet.type || wallet.wallet_type || 'REGULAR';
                                    return (
                                        <div
                                            key={wallet.wallet_id}
                                            className="group flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-primary-50 transition-colors`}>
                                                    <Wallet className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-gray-900 truncate">
                                                            {shortenAddress(wallet.wallet_address, 8)}
                                                        </h4>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${WALLET_TYPE_COLORS[walletType] || 'bg-gray-100 text-gray-600'}`}>
                                                            {WALLET_TYPE_LABELS[walletType] || walletType}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 font-mono">
                                                        {wallet.wallet_id}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right pl-4">
                                                <p className="font-bold text-lg text-gray-900">{formatCurrency(wallet.balance)}</p>
                                                {wallet.locked_balance > 0 && (
                                                    <p className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                                        +{formatCurrency(wallet.locked_balance)} locked
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Quick actions */}
                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-primary-500/30 blur-2xl" />

                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 relative z-10">
                            <Link to="/wallets" className="block">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer group">
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:text-blue-200">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Transfer</p>
                                        <p className="text-xs text-gray-400 group-hover:text-gray-300">Send ICL coins</p>
                                    </div>
                                </div>
                            </Link>

                            {hasWalletType('REGULAR') && (
                                <Link to="/nodes/apply" className="block">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer group">
                                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 group-hover:text-purple-200">
                                            <Server className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Apply Node</p>
                                            <p className="text-xs text-gray-400 group-hover:text-gray-300">Become a validator</p>
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {hasWalletType('NODE_WALLET') && (
                                <Link to="/voting" className="block">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer group">
                                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 group-hover:text-amber-200">
                                            <Vote className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Vote</p>
                                            <p className="text-xs text-gray-400 group-hover:text-gray-300">Governance decisions</p>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Active Votes - only for node operators */}
                    {hasWalletType('NODE_WALLET') && votes.length > 0 && (
                        <Card className="border-none shadow-lg shadow-amber-500/10 border-t-4 border-amber-500">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">Active Votes</CardTitle>
                                <Link to="/voting">
                                    <Button variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-50">
                                        All Votes
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {votes.slice(0, 3).map((vote) => (
                                        <div
                                            key={vote.vote_id}
                                            className="p-3 rounded-xl bg-amber-50 border border-amber-100/50 hover:border-amber-200 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <Badge variant="warning" className="text-[10px] px-1.5 py-0">Pending</Badge>
                                                <span className="text-xs font-medium text-amber-700">Ends {formatDateShort(vote.voting_end)}</span>
                                            </div>
                                            <p className="font-bold text-gray-900 truncate">
                                                {vote.vote_type.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
