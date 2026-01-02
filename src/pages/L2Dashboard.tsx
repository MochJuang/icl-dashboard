import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Layers, Plus, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { l2Api } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import type { L2 } from '../types';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    ACTIVE: 'success',
    REJECTED: 'danger',
    SUSPENDED: 'danger',
};

export default function L2Dashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['my-l2s'],
        queryFn: l2Api.getMyL2s,
    });

    const l2s: L2[] = data?.data?.l2s || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My L2 Applications</h1>
                    <p className="text-gray-500 mt-1">Manage your Layer-2 applications</p>
                </div>
                <Link to="/l2/register">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Register New L2
                    </Button>
                </Link>
            </div>

            {/* L2 List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : l2s.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No L2 applications</h3>
                        <p className="text-gray-500 mb-4">You haven't registered any L2 applications yet.</p>
                        <Link to="/l2/register">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Register Your First L2
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                    {l2s.map((l2) => (
                        <Card key={l2.l2_id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-blue-500" />
                                        {l2.chaincode_name}
                                    </CardTitle>
                                    <Badge variant={statusVariants[l2.status] || 'default'}>
                                        {l2.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">L2 ID</p>
                                        <p className="font-medium">{l2.l2_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Base Fee</p>
                                        <p className="font-medium">{formatCurrency(l2.base_fee)} ICL</p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-2">Profit Sharing</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            Dev: {l2.profit_sharing.developer_share}%
                                        </span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                            Val: {l2.profit_sharing.validator_share}%
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                            Full: {l2.profit_sharing.fullnode_share}%
                                        </span>
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                            Proto: {l2.profit_sharing.protocol_share}%
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Created: {formatDate(l2.created_at)}
                                    </span>
                                    <Button variant="ghost" size="sm">
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
