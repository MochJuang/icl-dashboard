import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, X, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { walletApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

const createWalletSchema = z.object({
    pin: z.string().length(6, 'PIN must be 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

type CreateWalletFormData = z.infer<typeof createWalletSchema>;

interface CreateWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateWalletModal({ isOpen, onClose }: CreateWalletModalProps) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateWalletFormData>({
        resolver: zodResolver(createWalletSchema),
    });

    const mutation = useMutation({
        mutationFn: (pin: string) => walletApi.createWallet(pin),
        onSuccess: (response: any) => {
            if (response.success) {
                setSuccess(true);
                queryClient.invalidateQueries({ queryKey: ['wallets'] });
                showToast('Wallet created successfully', 'success');
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                setError(response.error || 'Failed to create wallet');
                showToast(response.error || 'Failed to create wallet', 'error');
            }
        },
        onError: (err: Error) => {
            setError(err.message || 'Failed to create wallet. Please try again.');
            showToast(err.message || 'Failed to create wallet', 'error');
        },
    });

    const handleClose = () => {
        reset();
        setError('');
        setSuccess(false);
        onClose();
    };

    const onSubmit = (data: CreateWalletFormData) => {
        setError('');
        mutation.mutate(data.pin);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-lg font-semibold">
                            Create New Wallet
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                <X className="h-4 w-4" />
                            </Button>
                        </Dialog.Close>
                    </div>

                    {success ? (
                        <div className="text-center py-8">
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Wallet Created!</h3>
                            <p className="text-gray-500">Your new wallet is ready to use.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <Wallet className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">Regular Wallet</span>
                                </div>
                                <p className="text-sm text-blue-700">
                                    A new REGULAR wallet will be created. You can use it to store and transfer coins.
                                </p>
                            </div>

                            <div className="pt-2">
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    Security PIN
                                </label>
                                <Input
                                    type="password"
                                    maxLength={6}
                                    placeholder="Enter 6-digit PIN"
                                    className="font-mono tracking-widest text-center"
                                    error={errors.pin?.message}
                                    {...register('pin')}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20" isLoading={mutation.isPending}>
                                    Create Wallet
                                </Button>
                            </div>
                        </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
