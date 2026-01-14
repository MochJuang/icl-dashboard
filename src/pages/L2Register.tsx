import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Layers, AlertCircle, Info, Lock, Coins } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { l2Api } from '../lib/api';

// Fixed admin fee constants (immutable)
const ADMIN_FEE = {
    VALIDATOR: 0.5,
    FULL_NODE: 0.3,
    PROTOCOL: 0.2,
    TOTAL: 1.0, // Minimum gas fee
};

const l2RegisterSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    document_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    fee: z.number().min(ADMIN_FEE.TOTAL, `Minimum fee is ${ADMIN_FEE.TOTAL} ICL`),
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
            fee: 1.5,
            description: '',
            document_link: '',
        },
    });

    const fee = watch('fee') || ADMIN_FEE.TOTAL;

    // Calculate profit sharing breakdown
    const profitBreakdown = useMemo(() => {
        const developerShare = Math.max(0, fee - ADMIN_FEE.TOTAL);
        return {
            validator: ADMIN_FEE.VALIDATOR,
            fullNode: ADMIN_FEE.FULL_NODE,
            protocol: ADMIN_FEE.PROTOCOL,
            developer: developerShare,
            total: fee,
        };
    }, [fee]);

    const mutation = useMutation({
        mutationFn: (data: L2RegisterFormData) => {
            // Transform to new API format
            const apiData = {
                pin: data.pin,
                name: data.name,
                description: data.description || '',
                document_link: data.document_link ? [data.document_link] : [],
                fee: data.fee,
            };
            return l2Api.register(apiData);
        },
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
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="border-b border-gray-200 pb-4 mb-6">
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
                                    label="Application Name"
                                    placeholder="my-application"
                                    error={errors.name?.message}
                                    {...register('name')}
                                />
                                <Input
                                    label="Document Link"
                                    placeholder="https://docs.example.com/whitepaper.pdf"
                                    error={errors.document_link?.message}
                                    {...register('document_link')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                    rows={3}
                                    placeholder="Describe your L2 application..."
                                    {...register('description')}
                                />
                            </div>
                        </div>

                        {/* Fee & Profit Sharing Section */}
                        <div className="space-y-4 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fee & Profit Sharing</h3>

                            {/* Fixed Admin Fee Notice */}
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                <div className="flex items-start gap-3">
                                    <Lock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">Fixed Admin Fee (Immutable)</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Every transaction incurs a fixed admin fee of <strong>1 ICL</strong>, distributed as follows:
                                        </p>
                                        <ul className="mt-2 space-y-1 text-sm text-amber-700">
                                            <li className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                                <span><strong>Validator:</strong> 0.5 ICL</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span><strong>Full Node:</strong> 0.3 ICL</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                                <span><strong>Protocol:</strong> 0.2 ICL</span>
                                            </li>
                                        </ul>
                                        <p className="text-xs text-amber-600 mt-2">This distribution cannot be changed.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Input */}
                            <div className="sm:w-1/2">
                                <Input
                                    label="Fee per Transaction (ICL)"
                                    type="number"
                                    step="0.1"
                                    min={ADMIN_FEE.TOTAL}
                                    placeholder={`Minimum ${ADMIN_FEE.TOTAL}`}
                                    error={errors.fee?.message}
                                    {...register('fee', { valueAsNumber: true })}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum: {ADMIN_FEE.TOTAL} ICL. Any amount above this goes to you (Developer).
                                </p>
                            </div>

                            {/* Live Profit Breakdown */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <Coins className="h-5 w-5 text-gray-600" />
                                    <p className="text-sm font-semibold text-gray-700">Profit Sharing Breakdown</p>
                                    <span className="ml-auto text-sm font-bold text-gray-900">
                                        {profitBreakdown.total.toFixed(2)} ICL / tx
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {/* Visual Bar */}
                                    <div className="h-4 rounded-full overflow-hidden flex bg-gray-200">
                                        <div
                                            className="bg-purple-500 transition-all duration-300"
                                            style={{ width: `${(profitBreakdown.validator / profitBreakdown.total) * 100}%` }}
                                            title={`Validator: ${profitBreakdown.validator} ICL`}
                                        />
                                        <div
                                            className="bg-blue-500 transition-all duration-300"
                                            style={{ width: `${(profitBreakdown.fullNode / profitBreakdown.total) * 100}%` }}
                                            title={`Full Node: ${profitBreakdown.fullNode} ICL`}
                                        />
                                        <div
                                            className="bg-green-500 transition-all duration-300"
                                            style={{ width: `${(profitBreakdown.protocol / profitBreakdown.total) * 100}%` }}
                                            title={`Protocol: ${profitBreakdown.protocol} ICL`}
                                        />
                                        {profitBreakdown.developer > 0 && (
                                            <div
                                                className="bg-indigo-500 transition-all duration-300"
                                                style={{ width: `${(profitBreakdown.developer / profitBreakdown.total) * 100}%` }}
                                                title={`Developer: ${profitBreakdown.developer} ICL`}
                                            />
                                        )}
                                    </div>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
                                            <span className="w-3 h-3 rounded-full bg-purple-500" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Validator</p>
                                                <p className="font-bold text-gray-900">{profitBreakdown.validator.toFixed(2)} ICL</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
                                            <span className="w-3 h-3 rounded-full bg-blue-500" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Full Node</p>
                                                <p className="font-bold text-gray-900">{profitBreakdown.fullNode.toFixed(2)} ICL</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-gray-100">
                                            <span className="w-3 h-3 rounded-full bg-green-500" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Protocol</p>
                                                <p className="font-bold text-gray-900">{profitBreakdown.protocol.toFixed(2)} ICL</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-indigo-200 shadow-sm">
                                            <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                            <div>
                                                <p className="text-gray-500 text-xs">Developer (You)</p>
                                                <p className="font-bold text-indigo-600">{profitBreakdown.developer.toFixed(2)} ICL</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box: Developer share */}
                            {profitBreakdown.developer > 0 && (
                                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                    <div className="flex items-start gap-3">
                                        <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-indigo-800">
                                            You will receive <strong>{profitBreakdown.developer.toFixed(2)} ICL</strong> per transaction as developer profit.
                                        </p>
                                    </div>
                                </div>
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
