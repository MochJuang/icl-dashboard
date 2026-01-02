import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, X, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { walletApi } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import type { Wallet } from '../../types';

const transferSchema = z.object({
    to_wallet_id: z.string().min(1, 'Recipient wallet address is required'),
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
    const queryClient = useQueryClient();
    const toast = useToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TransferFormData>({
        resolver: zodResolver(transferSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: TransferFormData) =>
            walletApi.transfer({
                from_wallet_id: wallet?.wallet_id || '',
                to_wallet_id: data.to_wallet_id,
                amount: data.amount,
                pin: data.pin,
            }),
        onSuccess: (response) => {
            if (response.success) {
                setSuccess(true);
                queryClient.invalidateQueries({ queryKey: ['wallets'] });
                toast.success('Transfer Successful', 'Coins have been sent to the recipient');
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                setError(response.error || 'Transfer failed');
                toast.error('Transfer Failed', response.error || 'Please try again');
            }
        },
        onError: (err: Error) => {
            setError(err.message || 'Transfer failed. Please try again.');
        },
    });

    const handleClose = () => {
        reset();
        setError('');
        setSuccess(false);
        onClose();
    };

    const onSubmit = (data: TransferFormData) => {
        setError('');
        mutation.mutate(data);
    };

    if (!wallet) return null;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-lg font-semibold">
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
                                <Send className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Transfer Successful!</h3>
                            <p className="text-gray-500">Your coins have been sent.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="p-4 rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-500">From Wallet</p>
                                <p className="font-medium">{wallet.wallet_type} Wallet</p>
                                <p className="text-sm text-gray-500">
                                    Balance: {formatCurrency(wallet.balance)} ICL
                                </p>
                            </div>

                            <Input
                                label="Recipient Wallet Address"
                                placeholder="Enter wallet address"
                                error={errors.to_wallet_id?.message}
                                {...register('to_wallet_id')}
                            />

                            <Input
                                label="Amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                error={errors.amount?.message}
                                {...register('amount', { valueAsNumber: true })}
                            />

                            <Input
                                label="PIN"
                                type="password"
                                maxLength={6}
                                placeholder="Enter 6-digit PIN"
                                error={errors.pin?.message}
                                {...register('pin')}
                            />

                            <div className="flex gap-3 pt-4">
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
