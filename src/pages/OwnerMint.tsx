import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Coins, ArrowRight, AlertCircle, Check } from 'lucide-react';
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

    const ownerWallet: Wallet | undefined = (walletsData?.data?.wallets || []).find(
        (w: Wallet) => w.wallet_type === 'OWNER'
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MintFormData>({
        resolver: zodResolver(mintSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: MintFormData) => walletApi.mint(data),
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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mint Coins</h1>
                <p className="text-gray-500 mt-2">Create new ICL coins (Owner only)</p>
            </div>

            {/* Owner Wallet Balance */}
            {ownerWallet && (
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg max-w-xl">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Coins className="h-6 w-6" />
                            </div>
                            <span className="text-amber-100 font-medium">Owner Wallet Balance</span>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(ownerWallet.balance)} ICL</p>
                    </CardContent>
                </Card>
            )}

            {/* Mint Form Card */}
            <Card className="max-w-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-amber-500" />
                        Mint New Coins
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center py-8">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Minting Successful!</h3>
                            <p className="text-gray-500">New coins have been added to your Owner wallet.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                                <p className="text-sm text-amber-700">
                                    <strong>Warning:</strong> Minting creates new coins and adds them to the total supply.
                                    This action is recorded on the blockchain and cannot be undone.
                                </p>
                            </div>

                            <Input
                                label="Amount to Mint"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                error={errors.amount?.message}
                                {...register('amount', { valueAsNumber: true })}
                            />

                            <div className="flex items-center justify-center gap-4 py-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Minting Amount</p>
                                    <p className="text-xl font-bold text-amber-600">
                                        +{errors.amount ? '0.00' : '...'} ICL
                                    </p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400" />
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Owner Wallet</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {ownerWallet?.wallet_address?.slice(0, 10)}...
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <Input
                                    label="Enter PIN to Confirm"
                                    type="password"
                                    maxLength={6}
                                    placeholder="Enter 6-digit PIN"
                                    error={errors.pin?.message}
                                    {...register('pin')}
                                />
                            </div>

                            <Button type="submit" className="w-full" isLoading={mutation.isPending}>
                                <Coins className="h-4 w-4 mr-2" />
                                Mint Coins
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
