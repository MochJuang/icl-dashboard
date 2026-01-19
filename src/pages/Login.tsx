import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { authApi, userApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { LoginResponseData } from '../types';

export default function Login() {
    const navigate = useNavigate();
    const { login, updateUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const loginMutation = useMutation({
        mutationFn: () => authApi.login(email, password),
        onSuccess: async (response) => {
            if (response.success && response.data) {
                const data = response.data as LoginResponseData;

                // Wait for login to complete (fetches wallets from API)
                await login(data);

                // Fetch full profile to get full_name
                try {
                    const profileResponse = await userApi.getProfile();
                    if (profileResponse.success && profileResponse.data) {
                        updateUser({
                            user_id: data.user_id,
                            email: data.email,
                            full_name: profileResponse.data.full_name || '',
                            kyc_status: profileResponse.data.kyc_status || 'PENDING',
                        });
                    }
                } catch {
                    // Profile fetch failed, continue with basic info
                }

                navigate('/');
            } else {
                setError(response.error || 'Login failed. Please try again.');
            }
        },
        onError: (err: Error & { response?: { data?: { error?: string } } }) => {
            const message = err.response?.data?.error || err.message || 'Login failed. Please try again.';
            setError(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        loginMutation.mutate();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 flex items-center justify-center p-4">
            {/* Background animated gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl shadow-primary-500/20 mb-6 transform hover:scale-105 transition-transform duration-300">
                        <Layers className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
                    <p className="text-gray-400 mt-2">Sign in to access your dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Alert */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-slide-in">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all hover:bg-white/10"
                                    placeholder="name@example.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all hover:bg-white/10"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 p-0.5 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full py-3.5 text-base font-semibold bg-gradient-to-r from-primary-600 to-primary-500 hover:to-primary-400 shadow-lg shadow-primary-500/25 border-0"
                            isLoading={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-primary-400 hover:text-primary-300 font-medium transition-colors hover:underline underline-offset-4"
                            >
                                Get started
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-8">
                    © {new Date().getFullYear()} ICL Network. Secure & Dezentralized.
                </p>
            </div>
        </div>
    );
}
