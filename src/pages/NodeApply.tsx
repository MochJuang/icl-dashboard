import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Server, AlertCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { nodeApi, walletApi } from '../lib/api';
import { STAKE_REQUIREMENTS } from '../lib/constants';
import { formatCurrency } from '../lib/utils';
import type { Wallet as WalletType } from '../types';

const nodeApplySchema = z.object({
    node_type: z.enum(['VALIDATOR', 'FULL_NODE']),
    stake_wallet_id: z.string().min(1, 'Please select a wallet'),
    endpoint_url: z.string().url('Please enter a valid URL'),
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

    const regularWallets: WalletType[] = (walletsData?.data?.wallets || []).filter(
        (w: WalletType) => w.wallet_type === 'REGULAR' && w.status === 'ACTIVE'
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
    const hasEnoughBalance = selectedWallet && selectedWallet.balance >= stakeRequired;

    const mutation = useMutation({
        mutationFn: (data: NodeApplyFormData) => nodeApi.apply(data),
        onSuccess: (response) => {
            if (response.success) {
                navigate('/nodes');
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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Apply to Become a Node</h1>
                <p className="text-gray-500 mt-2">Join the network as a validator or full node</p>
            </div>

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-purple-500" />
                        Node Application
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Node Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Node Type</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label
                                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${nodeType === 'VALIDATOR'
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value="VALIDATOR"
                                        className="sr-only"
                                        {...register('node_type')}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">Validator Node</span>
                                        <span className="text-sm text-gray-500">
                                            Stake: {formatCurrency(STAKE_REQUIREMENTS.VALIDATOR)} ICL
                                        </span>
                                    </div>
                                </label>

                                <label
                                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${nodeType === 'FULL_NODE'
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value="FULL_NODE"
                                        className="sr-only"
                                        {...register('node_type')}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">Full Node</span>
                                        <span className="text-sm text-gray-500">
                                            Stake: {formatCurrency(STAKE_REQUIREMENTS.FULL_NODE)} ICL
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Stake Info */}
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-purple-600 mt-0.5" />
                                <div className="text-sm text-purple-700">
                                    <p className="font-medium mb-1">Stake Requirement: {formatCurrency(stakeRequired)} ICL</p>
                                    <p>Your stake will be locked in escrow until your application is processed. If approved, the stake is transferred to your NODE wallet.</p>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Wallet for Staking
                            </label>
                            <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                {...register('stake_wallet_id')}
                            >
                                <option value="">Select a wallet</option>
                                {regularWallets.map((wallet) => (
                                    <option key={wallet.wallet_id} value={wallet.wallet_id}>
                                        {wallet.wallet_address?.slice(0, 10)}... - Balance: {formatCurrency(wallet.balance)} ICL
                                    </option>
                                ))}
                            </select>
                            {errors.stake_wallet_id && (
                                <p className="text-sm text-red-500 mt-1">{errors.stake_wallet_id.message}</p>
                            )}
                            {selectedWallet && !hasEnoughBalance && (
                                <p className="text-sm text-red-500 mt-1">
                                    Insufficient balance. You need {formatCurrency(stakeRequired)} ICL.
                                </p>
                            )}
                        </div>

                        <Input
                            label="Node Endpoint URL"
                            type="url"
                            placeholder="https://my-node.example.com:7051"
                            error={errors.endpoint_url?.message}
                            {...register('endpoint_url')}
                        />

                        <div className="pt-4 border-t border-gray-200">
                            <Input
                                label="Enter PIN to Submit"
                                type="password"
                                maxLength={6}
                                placeholder="Enter 6-digit PIN"
                                error={errors.pin?.message}
                                {...register('pin')}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/nodes')}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={mutation.isPending}
                                disabled={!hasEnoughBalance}
                            >
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
