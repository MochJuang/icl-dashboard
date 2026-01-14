import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Server, AlertCircle, Info, CheckCircle2, ChevronRight, ShieldCheck, Database, Wallet } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { nodeApi, walletApi } from '../lib/api';
import { STAKE_REQUIREMENTS } from '../lib/constants';
import { formatCurrency, cn } from '../lib/utils';
import type { Wallet as WalletType } from '../types';

const nodeApplySchema = z.object({
    node_type: z.enum(['VALIDATOR', 'FULL_NODE']),
    stake_wallet_id: z.string().min(1, 'Please select a wallet'),
    endpoint_url: z.string().url('Please enter a valid URL (e.g. https://node.example.com:7051)'),
    pin: z.string().length(6, 'PIN must be 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

type NodeApplyFormData = z.infer<typeof nodeApplySchema>;

export default function NodeApply() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { data: walletsData } = useQuery({
        queryKey: ['wallets'],
        queryFn: walletApi.getWallets,
    });

    const regularWallets: WalletType[] = (walletsData?.data || []).filter(
        (w: WalletType) => (w.type === 'REGULAR' || w.wallet_type === 'REGULAR') && w.status === 'ACTIVE'
    );

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<NodeApplyFormData>({
        resolver: zodResolver(nodeApplySchema),
        defaultValues: {
            node_type: 'VALIDATOR',
        },
    });

    const nodeType = watch('node_type');
    const selectedWalletId = watch('stake_wallet_id');
    const stakeRequired = STAKE_REQUIREMENTS[nodeType as keyof typeof STAKE_REQUIREMENTS] || 0;
    const selectedWallet = regularWallets.find((w) => w.wallet_id === selectedWalletId);
    const hasEnoughBalance = selectedWallet && (selectedWallet.balance || 0) >= stakeRequired;

    const mutation = useMutation({
        mutationFn: (data: NodeApplyFormData) => {
            const wallet = regularWallets.find((w) => w.wallet_id === data.stake_wallet_id);
            if (!wallet) throw new Error('Selected wallet not found');

            return nodeApi.apply({
                wallet_id: wallet.wallet_id,
                pin: data.pin,
                request: {
                    node_type: data.node_type,
                    stake_amount: STAKE_REQUIREMENTS[data.node_type],
                    endpoint: data.endpoint_url
                }
            });
        },
        onSuccess: (response) => {
            if (response.success) {
                navigate('/applications/node');
            } else {
                setError(response.error || 'Application failed');
            }
        },
        onError: (err: Error) => {
            setError(err.message || 'Application failed. Please try again.');
        },
    });

    const onSubmit = (data: NodeApplyFormData) => {
        setError('');
        mutation.mutate(data);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Node Application</h1>
                    <p className="text-gray-500 font-medium">Join the network infrastructure as a validator or full node</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Server className="h-5 w-5 text-purple-600" />
                                </div>
                                Application Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {error && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 animate-in slide-in-from-top-2">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                {/* Node Type Selection */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Select Node Type</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label
                                            className={cn(
                                                "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                                                nodeType === 'VALIDATOR'
                                                    ? "border-purple-600 bg-purple-50/50 shadow-md shadow-purple-500/10"
                                                    : "border-gray-100 bg-white hover:border-purple-200"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                value="VALIDATOR"
                                                className="sr-only"
                                                {...register('node_type')}
                                            />
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                                                    <ShieldCheck className={cn("h-5 w-5", nodeType === 'VALIDATOR' ? "text-purple-600" : "text-gray-400")} />
                                                </div>
                                                {nodeType === 'VALIDATOR' && <CheckCircle2 className="h-5 w-5 text-purple-600" />}
                                            </div>
                                            <span className="font-bold text-gray-900">Validator Node</span>
                                            <span className="text-xs text-gray-500 mt-1">Participate in consensus & earn rewards</span>
                                            <div className="mt-4 pt-3 border-t border-purple-100/50">
                                                <p className="text-xs font-semibold text-purple-700">Stake: {formatCurrency(STAKE_REQUIREMENTS.VALIDATOR)} ICL</p>
                                            </div>
                                        </label>

                                        <label
                                            className={cn(
                                                "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                                                nodeType === 'FULL_NODE'
                                                    ? "border-purple-600 bg-purple-50/50 shadow-md shadow-purple-500/10"
                                                    : "border-gray-100 bg-white hover:border-purple-200"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                value="FULL_NODE"
                                                className="sr-only"
                                                {...register('node_type')}
                                            />
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                                                    <Database className={cn("h-5 w-5", nodeType === 'FULL_NODE' ? "text-purple-600" : "text-gray-400")} />
                                                </div>
                                                {nodeType === 'FULL_NODE' && <CheckCircle2 className="h-5 w-5 text-purple-600" />}
                                            </div>
                                            <span className="font-bold text-gray-900">Full Node</span>
                                            <span className="text-xs text-gray-500 mt-1">Store ledger copy & serve requests</span>
                                            <div className="mt-4 pt-3 border-t border-purple-100/50">
                                                <p className="text-xs font-semibold text-purple-700">Stake: {formatCurrency(STAKE_REQUIREMENTS.FULL_NODE)} ICL</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Stake Wallet */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Staking Wallet</label>
                                    <div className="relative">
                                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        <select
                                            className={cn(
                                                "w-full rounded-xl border-gray-200 pl-10 h-11 text-sm focus:border-purple-500 focus:ring-purple-500/20 transition-all",
                                                errors.stake_wallet_id ? "border-red-300" : "hover:border-gray-300"
                                            )}
                                            {...register('stake_wallet_id')}
                                        >
                                            <option value="">Select a wallet for staking...</option>
                                            {regularWallets.map((wallet) => (
                                                <option key={wallet.wallet_id} value={wallet.wallet_id}>
                                                    {wallet.wallet_address.slice(0, 10)}... — {formatCurrency(wallet.balance)} ICL
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.stake_wallet_id && (
                                        <p className="text-xs text-red-500 ml-1">{errors.stake_wallet_id.message}</p>
                                    )}
                                    {selectedWallet && !hasEnoughBalance && (
                                        <div className="flex items-center gap-2 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                                            <AlertCircle className="h-3 w-3" />
                                            Insufficient balance. Requires {formatCurrency(stakeRequired)} ICL.
                                        </div>
                                    )}
                                </div>

                                <Input
                                    label="Node Endpoint URL"
                                    type="url"
                                    placeholder="https://my-node.example.com:7051"
                                    error={errors.endpoint_url?.message}
                                    {...register('endpoint_url')}
                                />

                                <div className="pt-6 border-t border-gray-100">
                                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                        Confirm with PIN
                                    </label>
                                    <Input
                                        type="password"
                                        maxLength={6}
                                        placeholder="Enter 6-digit PIN"
                                        className="font-mono tracking-widest h-12"
                                        error={errors.pin?.message}
                                        {...register('pin')}
                                    />
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <Button type="button" variant="outline" className="flex-1 h-11 border-gray-200 hover:bg-gray-50" onClick={() => navigate('/nodes')}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20"
                                        isLoading={mutation.isPending}
                                        disabled={!selectedWallet || !hasEnoughBalance || mutation.isPending}
                                    >
                                        Submit Application
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Info className="h-5 w-5 text-purple-200" />
                            Requirements
                        </h3>
                        <ul className="space-y-4 text-sm text-purple-100">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">1</span>
                                <p>You must have a <span className="font-semibold text-white">REGULAR</span> wallet with sufficient balance for the stake.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</span>
                                <p>The stake amount will be <span className="font-semibold text-white">locked</span> in escrow until your application is approved.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</span>
                                <p>Validators perform consensus duties and earn block rewards.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
