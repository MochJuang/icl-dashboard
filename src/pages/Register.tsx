import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Layers, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { authApi } from '../lib/api';

const registerSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
    pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
    confirm_pin: z.string(),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
}).refine((data) => data.pin === data.confirm_pin, {
    message: 'PINs do not match',
    path: ['confirm_pin'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: RegisterFormData) =>
            authApi.register({
                full_name: data.full_name,
                email: data.email,
                password: data.password,
                pin: data.pin,
            }),
        onSuccess: (response) => {
            if (response.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(response.error || 'Registration failed');
            }
        },
        onError: (err: Error) => {
            setError(err.message || 'Registration failed. Please try again.');
        },
    });

    const onSubmit = (data: RegisterFormData) => {
        setError('');
        mutation.mutate(data);
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <div className="mx-auto h-16 w-16 rounded-full bg-success-500 flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
                        <p className="text-gray-500">Redirecting to login page...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary-500 flex items-center justify-center mb-4">
                        <Layers className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Join the ICL Blockchain network</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-danger-500/10 text-danger-500 text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            error={errors.full_name?.message}
                            {...register('full_name')}
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    label="Confirm Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    error={errors.confirm_password?.message}
                                    {...register('confirm_password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <Input
                                    label="6-Digit PIN"
                                    type={showPin ? 'text' : 'password'}
                                    placeholder="••••••"
                                    maxLength={6}
                                    error={errors.pin?.message}
                                    {...register('pin')}
                                />
                            </div>
                            <div className="relative">
                                <Input
                                    label="Confirm PIN"
                                    type={showPin ? 'text' : 'password'}
                                    placeholder="••••••"
                                    maxLength={6}
                                    error={errors.confirm_pin?.message}
                                    {...register('confirm_pin')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                                >
                                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Your PIN is used to sign blockchain transactions. Keep it secure and never share it.
                        </p>

                        <label className="flex items-start gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 mt-0.5"
                                {...register('terms')}
                            />
                            <span>
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary-500 hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-primary-500 hover:underline">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                        {errors.terms && (
                            <p className="text-sm text-danger-500">{errors.terms.message}</p>
                        )}
                    </CardContent>

                    <CardFooter className="flex-col gap-4">
                        <Button type="submit" className="w-full" isLoading={mutation.isPending}>
                            Create account
                        </Button>
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-500 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
