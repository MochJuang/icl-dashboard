import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, Key, Copy, CheckCircle, Eye, EyeOff,
    DollarSign, Activity, FileText, Clock, TrendingUp, Users,
    RefreshCw, ExternalLink, Server
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { l2Api } from '../lib/api';
import { formatDate, formatCurrency, copyToClipboard } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface L2Application {
    l2_id: string;
    name: string;
    document_link: string;
    fee: number;
    description: string;
    owner_user_id: string;
    developer_wallet_id: string;
    vote_id: string;
    status: string;
    submitted_at: string;
    approved_at?: string;
    auth_username: string;
    auth_password: string;
    validator_share: number;
    full_node_share: number;
    protocol_share: number;
    developer_share: number;
    api_endpoint?: string;
}

interface L2Transaction {
    tx_id: string;
    type: string;
    timestamp: string;
    fee: number;
    status: string;
    from_wallet?: string;
    to_wallet?: string;
    data_hash?: string;
    ipfs_cid?: string;
}

interface L2Stats {
    total_transactions: number;
    total_fees_collected: number;
    total_files: number;
    total_data_records: number;
    developer_earnings: number;
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    ACTIVE: 'success',
    REJECTED: 'danger',
    SUSPENDED: 'danger',
};

export default function L2Detail() {
    const { l2Id } = useParams<{ l2Id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [transactionPage, setTransactionPage] = useState(1);
    const transactionsPerPage = 10;

    // Fetch L2 details
    const { data: l2Data, isLoading: isLoadingL2, refetch: refetchL2 } = useQuery({
        queryKey: ['l2-detail', l2Id],
        queryFn: () => l2Api.getL2(l2Id || ''),
        enabled: !!l2Id,
    });

    // Fetch L2 transactions
    const { data: transactionsData, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useQuery({
        queryKey: ['l2-transactions', l2Id, transactionPage],
        queryFn: () => l2Api.getTransactions(l2Id || '', transactionPage, transactionsPerPage),
        enabled: !!l2Id,
    });

    // Fetch L2 stats
    const { data: statsData } = useQuery({
        queryKey: ['l2-stats', l2Id],
        queryFn: () => l2Api.getStats(l2Id || ''),
        enabled: !!l2Id,
    });

    const l2: L2Application | undefined = l2Data?.data;
    const transactions: L2Transaction[] = transactionsData?.data?.transactions || [];
    const totalTransactions = transactionsData?.data?.total_count || 0;
    const stats: L2Stats | undefined = statsData?.data;

    const handleCopy = async (text: string, field: string) => {
        const success = await copyToClipboard(text);
        if (success) {
            setCopiedField(field);
            showToast('Copied to clipboard!', 'success');
            setTimeout(() => setCopiedField(null), 2000);
        }
    };

    const handleRefresh = () => {
        refetchL2();
        refetchTransactions();
    };

    // Generate API endpoint
    const apiEndpoint = l2?.api_endpoint || `${window.location.origin}/api/v1/l2-api`;

    // Calculate fee breakdown
    const calculateFeeBreakdown = (baseFee: number) => {
        const systemFee = 1.0; // Fixed system fee
        const developerFee = baseFee - systemFee;
        return {
            total: baseFee,
            system: systemFee,
            developer: developerFee > 0 ? developerFee : 0,
            validatorShare: systemFee * (l2?.validator_share || 0.5),
            fullNodeShare: systemFee * (l2?.full_node_share || 0.3),
            protocolShare: systemFee * (l2?.protocol_share || 0.2),
        };
    };

    if (isLoadingL2) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!l2) {
        return (
            <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">L2 Application not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/l2')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to L2 Dashboard
                </Button>
            </div>
        );
    }

    const feeBreakdown = calculateFeeBreakdown(l2.fee);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/l2')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{l2.name}</h1>
                            <Badge variant={statusVariants[l2.status] || 'default'}>
                                {l2.status}
                            </Badge>
                        </div>
                        <p className="text-gray-500 mt-1">{l2.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    {l2.document_link && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={l2.document_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Documentation
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats?.total_transactions || 0}
                                </p>
                                <p className="text-sm text-gray-500">Total Transactions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats?.total_fees_collected || 0)}
                                </p>
                                <p className="text-sm text-gray-500">Total Fees Collected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats?.developer_earnings || 0)}
                                </p>
                                <p className="text-sm text-gray-500">Your Earnings</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <FileText className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(stats?.total_files || 0) + (stats?.total_data_records || 0)}
                                </p>
                                <p className="text-sm text-gray-500">Files & Data Records</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* API Credentials */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-amber-500" />
                            API Credentials
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-sm text-amber-800">
                                <strong>Important:</strong> Keep these credentials secure. They are used to authenticate
                                your L2 application when submitting transactions via the API.
                            </p>
                        </div>

                        {/* API Endpoint */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Server className="inline h-4 w-4 mr-1" />
                                API Endpoint
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono truncate">
                                    {apiEndpoint}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(apiEndpoint, 'endpoint')}
                                >
                                    {copiedField === 'endpoint' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username (auth_username)
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                                    {l2.auth_username}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(l2.auth_username, 'username')}
                                >
                                    {copiedField === 'username' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password (auth_password)
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                                    {showPassword ? l2.auth_password : '••••••••••••••••••••'}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(l2.auth_password, 'password')}
                                >
                                    {copiedField === 'password' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* L2 ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                L2 ID
                            </label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono truncate">
                                    {l2.l2_id}
                                </code>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(l2.l2_id, 'l2_id')}
                                >
                                    {copiedField === 'l2_id' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Usage Example */}
                        <div className="mt-4 p-4 bg-gray-900 rounded-xl">
                            <p className="text-xs text-gray-400 mb-2">cURL Example:</p>
                            <code className="text-xs text-green-400 break-all">
                                curl -X POST {apiEndpoint}/save-file \<br />
                                &nbsp;&nbsp;-u "{l2.auth_username}:{showPassword ? l2.auth_password : '••••••'}" \<br />
                                &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                                &nbsp;&nbsp;-d '{`{"file_url":"https://example.com/file.pdf","file_name":"file.pdf","is_private":false}`}'
                            </code>
                        </div>
                    </CardContent>
                </Card>

                {/* Fee Structure */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            Fee Structure
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-sm text-blue-800">
                                Each transaction incurs a fee of <strong>{formatCurrency(l2.fee)}</strong>.
                                This fee is distributed among validators, full nodes, protocol, and you (the developer).
                            </p>
                        </div>

                        {/* Total Fee */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">Total Fee per Transaction</span>
                            <span className="text-xl font-bold text-gray-900">{formatCurrency(feeBreakdown.total)}</span>
                        </div>

                        {/* Fee Breakdown */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-500">Fee Distribution</h4>

                            {/* System Fee Section */}
                            <div className="p-3 border border-gray-200 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">System Fee (Fixed)</span>
                                    <span className="font-medium">{formatCurrency(feeBreakdown.system)}</span>
                                </div>
                                <div className="pl-4 space-y-1 text-xs text-gray-500">
                                    <div className="flex justify-between">
                                        <span>→ Validators ({(l2.validator_share * 100).toFixed(0)}%)</span>
                                        <span>{formatCurrency(feeBreakdown.validatorShare)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>→ Full Nodes ({(l2.full_node_share * 100).toFixed(0)}%)</span>
                                        <span>{formatCurrency(feeBreakdown.fullNodeShare)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>→ Protocol ({(l2.protocol_share * 100).toFixed(0)}%)</span>
                                        <span>{formatCurrency(feeBreakdown.protocolShare)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Developer Fee */}
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">Developer Earnings</span>
                                </div>
                                <span className="font-bold text-green-700">{formatCurrency(feeBreakdown.developer)}</span>
                            </div>
                        </div>

                        {/* Application Info */}
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                            <h4 className="text-sm font-medium text-gray-500">Application Info</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Submitted</p>
                                    <p className="font-medium">{formatDate(l2.submitted_at)}</p>
                                </div>
                                {l2.approved_at && (
                                    <div>
                                        <p className="text-gray-500">Approved</p>
                                        <p className="font-medium">{formatDate(l2.approved_at)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500">Vote ID</p>
                                    <p className="font-medium font-mono text-xs">{l2.vote_id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Developer Wallet</p>
                                    <p className="font-medium font-mono text-xs truncate">{l2.developer_wallet_id}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            Recent Transactions
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => refetchTransactions()}>
                            <RefreshCw className={`h-4 w-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingTransactions ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">No transactions yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Transactions will appear here once your L2 starts processing requests
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">TX ID</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Fee</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx.tx_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <code className="text-xs font-mono text-gray-600">
                                                        {tx.tx_id.slice(0, 16)}...
                                                    </code>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="default">{tx.type}</Badge>
                                                </td>
                                                <td className="py-3 px-4 font-medium">
                                                    {formatCurrency(tx.fee)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={tx.status === 'SUCCESS' ? 'success' : 'danger'}>
                                                        {tx.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(tx.timestamp)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalTransactions > transactionsPerPage && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        Showing {(transactionPage - 1) * transactionsPerPage + 1} - {Math.min(transactionPage * transactionsPerPage, totalTransactions)} of {totalTransactions}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={transactionPage === 1}
                                            onClick={() => setTransactionPage(p => p - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={transactionPage * transactionsPerPage >= totalTransactions}
                                            onClick={() => setTransactionPage(p => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

