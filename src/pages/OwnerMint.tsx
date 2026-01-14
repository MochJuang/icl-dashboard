import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Coins, ArrowRight, AlertCircle, Check, Loader2, Sparkles, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { walletApi } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import type { Wallet } from '../types';

const mintSchema = z.object({
    amount: z.number().positive('Amount must be greater than 0'),
    pin: z.string().length(6, 'PIN must be 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

type MintFormData = z.infer<typeof mintSchema>;

export default function OwnerMint() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const queryClient = useQueryClient();

    const { data: walletsData } = useQuery({
        queryKey: ['wallets'],
        queryFn: walletApi.getWallets,
    });

    const ownerWallet: Wallet | undefined = (walletsData?.data || []).find(
        (w: Wallet) => w.type === 'OWNER' || w.wallet_type === 'OWNER'
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm<MintFormData>({
        resolver: zodResolver(mintSchema),
    });

    const amount = watch('amount');

    const mutation = useMutation({
        mutationFn: (data: MintFormData) => {
            if (!ownerWallet) throw new Error('Owner wallet not found');
            return walletApi.mint({
                wallet_address: ownerWallet.wallet_address,
                pin: data.pin,
                amount: data.amount,
            });
        },
        onSuccess: (response) => {
            if (response.success) {
                setSuccess(true);
                queryClient.invalidateQueries({ queryKey: ['wallets'] });
                setTimeout(() => {
                    setSuccess(false);
                    reset();
                }, 3000);
            } else {
                setError(response.error || 'Minting failed');
            }
        },
        onError: (err: Error) => {
            setError(err.message || 'Minting failed. Please try again.');
        },
    });

    const onSubmit = (data: MintFormData) => {
        setError('');
        mutation.mutate(data);
    };

    if (!ownerWallet) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-gray-500">You do not have an Owner wallet required to access this page.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mint Coins</h1>
                    <p className="text-gray-500 font-medium">Create new ICL coins and add to circulation</p>
                </div>
                <div className="px-4 py-2 bg-amber-50 rounded-lg border border-amber-100 text-amber-900 text-sm font-medium">
                    Owner Access Only
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Form */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-gray-100 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Plus className="h-5 w-5 text-amber-600" />
                            </div>
                            Mint Tokens
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {success ? (
                            <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                                <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6 ring-8 ring-green-50">
                                    <Check className="h-10 w-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Minting Successful!</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Successfully minted <span className="font-bold text-gray-900">{formatCurrency(amount)} ICL</span>.
                                    The coins have been added to your Owner wallet.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {error && (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 animate-in slide-in-from-top-2">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="relative">
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                            Amount to Mint
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="pl-4 pr-12 text-lg font-medium h-14"
                                                error={errors.amount?.message}
                                                {...register('amount', { valueAsNumber: true })}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                                ICL
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            This will increase total supply. Action is irreversible.
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                                        <div className="text-center flex-1">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Minting</p>
                                            <p className="text-2xl font-bold text-amber-600">
                                                +{amount ? formatCurrency(amount) : '0.00'}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-300" />
                                        <div className="text-center flex-1">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Destination</p>
                                            <div className="flex flex-col items-center">
                                                <p className="text-sm font-medium text-gray-900">Owner Wallet</p>
                                                <p className="text-xs text-gray-400 font-mono">
                                                    {ownerWallet.wallet_address?.slice(0, 6)}...{ownerWallet.wallet_address?.slice(-4)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                            Security PIN
                                        </label>
                                        <Input
                                            type="password"
                                            maxLength={6}
                                            placeholder="Enter 6-digit PIN"
                                            className="font-mono tracking-widest text-center text-lg h-12"
                                            error={errors.pin?.message}
                                            {...register('pin')}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/20"
                                    isLoading={mutation.isPending}
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Minting Coins...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-5 w-5 mr-2" />
                                            Confirm Minting
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column: Wallet Info */}
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-xl shadow-amber-500/20">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-black/5 blur-2xl" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                                    <Coins className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-amber-100 font-medium text-sm">Owner Balance</p>
                                    <p className="text-xs text-amber-200/80 font-mono">{ownerWallet.wallet_address}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-4xl font-bold tracking-tight mb-1">
                                    {formatCurrency(ownerWallet.balance)}
                                </p>
                                <p className="text-amber-100 text-sm font-medium">Available ICL</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex items-start gap-2 text-xs text-amber-100/90 leading-relaxed">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <p>
                                        Minted coins are immediately available in this wallet but are recorded publicly on the ledger.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
