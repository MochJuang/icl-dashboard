import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Layers, AlertCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { l2Api } from '../lib/api';

const profitSharingSchema = z.object({
    developer_share: z.number().min(0).max(100),
    validator_share: z.number().min(0).max(100),
    fullnode_share: z.number().min(0).max(100),
    protocol_share: z.number().min(0).max(100),
}).refine(
    (data) => data.developer_share + data.validator_share + data.fullnode_share + data.protocol_share === 100,
    { message: 'Total shares must equal 100%' }
);

const l2RegisterSchema = z.object({
    l2_id: z.string().min(3, 'L2 ID must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
    chaincode_name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    base_fee: z.number().positive('Base fee must be greater than 0'),
    profit_sharing: profitSharingSchema,
    pin: z.string().length(6, 'PIN must be 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

type L2RegisterFormData = z.infer<typeof l2RegisterSchema>;

export default function L2Register() {
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<L2RegisterFormData>({
        resolver: zodResolver(l2RegisterSchema),
        defaultValues: {
            profit_sharing: {
                developer_share: 20,
                validator_share: 40,
                fullnode_share: 30,
                protocol_share: 10,
            },
        },
    });

    const profitSharing = watch('profit_sharing');
    const totalShares = (profitSharing?.developer_share || 0) +
        (profitSharing?.validator_share || 0) +
        (profitSharing?.fullnode_share || 0) +
        (profitSharing?.protocol_share || 0);

    const mutation = useMutation({
        mutationFn: (data: L2RegisterFormData) => l2Api.register(data),
        onSuccess: (response) => {
            if (response.success) {
                navigate('/l2');
            } else {
                setError(response.error || 'Registration failed');
            }
        },
        onError: (err: Error) => {
            setError(err.message || 'Registration failed. Please try again.');
        },
    });

    const onSubmit = (data: L2RegisterFormData) => {
        setError('');
        mutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Register L2 Application</h1>
                <p className="text-gray-500 mt-2">Submit your L2 application for governance approval</p>
            </div>

            {/* Form Card */}
            <Card className="max-w-4xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-100">
                    <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Layers className="h-5 w-5 text-blue-600" />
                        </div>
                        Application Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    label="L2 ID"
                                    placeholder="my-application"
                                    error={errors.l2_id?.message}
                                    {...register('l2_id')}
                                />
                                <Input
                                    label="Application Name"
                                    placeholder="My Application"
                                    error={errors.chaincode_name?.message}
                                    {...register('chaincode_name')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                    rows={3}
                                    placeholder="Describe your L2 application..."
                                    {...register('description')}
                                />
                            </div>

                            <div className="sm:w-1/2">
                                <Input
                                    label="Base Fee (per unit)"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    error={errors.base_fee?.message}
                                    {...register('base_fee', { valueAsNumber: true })}
                                />
                            </div>
                        </div>

                        {/* Profit Sharing Section */}
                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Profit Sharing</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${totalShares === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    Total: {totalShares}%
                                </span>
                            </div>

                            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-800">
                                        Profit sharing determines how transaction fees are distributed among stakeholders. The total must equal exactly 100%.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <Input
                                    label="Developer (%)"
                                    type="number"
                                    min="0"
                                    max="100"
                                    error={errors.profit_sharing?.developer_share?.message}
                                    {...register('profit_sharing.developer_share', { valueAsNumber: true })}
                                />
                                <Input
                                    label="Validator (%)"
                                    type="number"
                                    min="0"
                                    max="100"
                                    error={errors.profit_sharing?.validator_share?.message}
                                    {...register('profit_sharing.validator_share', { valueAsNumber: true })}
                                />
                                <Input
                                    label="Full Node (%)"
                                    type="number"
                                    min="0"
                                    max="100"
                                    error={errors.profit_sharing?.fullnode_share?.message}
                                    {...register('profit_sharing.fullnode_share', { valueAsNumber: true })}
                                />
                                <Input
                                    label="Protocol (%)"
                                    type="number"
                                    min="0"
                                    max="100"
                                    error={errors.profit_sharing?.protocol_share?.message}
                                    {...register('profit_sharing.protocol_share', { valueAsNumber: true })}
                                />
                            </div>
                            {errors.profit_sharing?.root && (
                                <p className="text-sm text-red-500 font-medium">{errors.profit_sharing.root.message}</p>
                            )}
                        </div>

                        {/* PIN Section */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="sm:w-1/2">
                                <Input
                                    label="Enter PIN to Submit"
                                    type="password"
                                    maxLength={6}
                                    placeholder="Enter 6-digit PIN"
                                    error={errors.pin?.message}
                                    {...register('pin')}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                className="sm:flex-1"
                                onClick={() => navigate('/l2')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="sm:flex-1"
                                isLoading={mutation.isPending}
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
