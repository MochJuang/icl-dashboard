import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { walletApi } from '../../lib/api';
import { formatCurrency, shortenAddress } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { WALLET_TYPE_LABELS } from '../../lib/constants';
import type { Wallet } from '../../types';

const transferSchema = z.object({
    to_wallet_address: z.string().min(1, 'Recipient wallet address is required'),
    amount: z.number().positive('Amount must be greater than 0'),
    pin: z.string().length(6, 'PIN must be 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferModalProps {
    wallet: Wallet | null;
    isOpen: boolean;
    onClose: () => void;
}

export function TransferModal({ wallet, isOpen, onClose }: TransferModalProps) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [txResult, setTxResult] = useState<{ tx_id: string; fee_charged: number } | null>(null);
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
        defaultValues: {
            to_wallet_address: '',
            amount: undefined,
            pin: '',
        },
    });

    const amount = watch('amount');
    const estimatedFee = 0.0; // Transfer fee as per API
    const totalAmount = (amount || 0) + estimatedFee;

    const mutation = useMutation({
        mutationFn: (data: TransferFormData) =>
            walletApi.transfer({
                wallet_address: wallet?.wallet_address || '',
                pin: data.pin,
                transfer: {
                    to_wallet_address: data.to_wallet_address,
                    amount: data.amount,
                },
            }),
        onSuccess: (response) => {
            if (response.success) {
                setSuccess(true);
                setTxResult({
                    tx_id: response.data?.tx_id || '',
                    fee_charged: response.data?.fee_charged || 0,
                });
                queryClient.invalidateQueries({ queryKey: ['wallets'] });
                showToast('Transfer completed successfully', 'success');
            } else {
                setError(response.error || 'Transfer failed');
                showToast(response.error || 'Transfer failed', 'error');
            }
        },
        onError: (err: Error & { response?: { data?: { error?: string } } }) => {
            const message = err.response?.data?.error || err.message || 'Transfer failed. Please try again.';
            setError(message);
            showToast(message, 'error');
        },
    });

    const handleClose = () => {
        reset();
        setError('');
        setSuccess(false);
        setTxResult(null);
        onClose();
    };

    const onSubmit = (data: TransferFormData) => {
        if (!wallet) return;

        // Check if user has enough balance
        if (data.amount + estimatedFee > wallet.balance) {
            setError(`Insufficient balance. You need ${formatCurrency(data.amount + estimatedFee)} ICL (including ${estimatedFee} fee)`);
            return;
        }

        setError('');
        mutation.mutate(data);
    };

    if (!wallet) return null;

    const walletType = wallet.type || wallet.wallet_type || 'REGULAR';

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 w-[calc(100%-2rem)] max-w-md z-50 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold">
                            Transfer Coins
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </Dialog.Close>
                    </div>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Transfer Successful!</h3>
                            <p className="text-gray-500 mb-4">Your coins have been sent.</p>

                            {txResult && (
                                <div className="text-left bg-gray-50 rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Transaction ID</span>
                                        <span className="font-mono text-gray-900 truncate ml-2 max-w-[180px]">
                                            {shortenAddress(txResult.tx_id, 8)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Fee Charged</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(txResult.fee_charged)} ICL
                                        </span>
                                    </div>
                                </div>
                            )}

                            <Button className="mt-6" onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {error && (
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* From Wallet */}
                            <div className="p-4 rounded-xl bg-gray-50">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">From Wallet</p>
                                <p className="font-medium text-gray-900 mt-1">
                                    {WALLET_TYPE_LABELS[walletType]} • {shortenAddress(wallet.wallet_address, 6)}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Available: {formatCurrency(wallet.balance)} ICL
                                </p>
                            </div>

                            {/* Recipient Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recipient Wallet Address
                                </label>
                                <Input
                                    placeholder="0x..."
                                    error={errors.to_wallet_address?.message}
                                    {...register('to_wallet_address')}
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Amount
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    error={errors.amount?.message}
                                    {...register('amount', { valueAsNumber: true })}
                                />
                            </div>

                            {/* Fee Info */}
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
                                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p>Transfer fee: {formatCurrency(estimatedFee)} ICL</p>
                                    {amount > 0 && (
                                        <p className="font-medium mt-1">
                                            Total: {formatCurrency(totalAmount)} ICL
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* PIN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter PIN to Confirm
                                </label>
                                <Input
                                    type="password"
                                    maxLength={6}
                                    placeholder="Enter 6-digit PIN"
                                    className="text-center text-lg tracking-widest"
                                    error={errors.pin?.message}
                                    {...register('pin')}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1" isLoading={mutation.isPending}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send
                                </Button>
                            </div>
                        </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
