import { useQuery } from '@tanstack/react-query';
import { Server, RefreshCw, Activity, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { nodeApi } from '../lib/api';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import type { Node } from '../types';

const nodeTypeColors: Record<string, string> = {
    VALIDATOR: 'bg-purple-100 text-purple-700 border-purple-200',
    FULL_NODE: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function ActiveNodes() {
    const { data: nodesData, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['active-nodes'],
        queryFn: nodeApi.getActiveNodes,
    });

    const nodes: Node[] = nodesData?.data || [];
    const validators = nodes.filter(n => n.node_type === 'VALIDATOR');
    const fullNodes = nodes.filter(n => n.node_type === 'FULL_NODE');

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Nodes</h1>
                    <p className="text-gray-500 mt-1">View all active nodes in the ICL network</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3 mb-8">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl shadow-purple-500/20 h-full">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Server className="h-5 w-5" />
                            </div>
                            <span className="text-purple-100 font-medium">Validators</span>
                        </div>
                        <p className="text-4xl font-bold tracking-tight">{validators.length}</p>
                        <p className="text-purple-200 text-sm mt-1">Active validator nodes</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/20 h-full">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="text-blue-100 font-medium">Full Nodes</span>
                        </div>
                        <p className="text-4xl font-bold tracking-tight">{fullNodes.length}</p>
                        <p className="text-blue-200 text-sm mt-1">Active full nodes</p>
                    </CardContent>
                </Card>

                <Card className="shadow-lg shadow-gray-200/50 h-full">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-green-50 text-green-600 border border-green-100">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-gray-600 font-medium">Total Nodes</span>
                        </div>
                        <p className="text-4xl font-bold text-gray-900 tracking-tight">{nodes.length}</p>
                        <p className="text-gray-500 text-sm mt-1">Combined network nodes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Nodes List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Network Nodes</CardTitle>
                    <span className="text-sm text-gray-500">{nodes.length} nodes</span>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                        </div>
                    ) : nodes.length === 0 ? (
                        <div className="text-center py-12">
                            <Server className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No active nodes</h3>
                            <p className="text-gray-500">There are no active nodes in the network yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {nodes.map((node) => (
                                <div
                                    key={node.node_id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            'p-2.5 rounded-xl',
                                            node.node_type === 'VALIDATOR' ? 'bg-purple-100' : 'bg-blue-100'
                                        )}>
                                            <Server className={cn(
                                                'h-5 w-5',
                                                node.node_type === 'VALIDATOR' ? 'text-purple-600' : 'text-blue-600'
                                            )} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{node.node_id}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                                                <span>Operator: {node.operator || 'Unknown'}</span>
                                                {node.joined_at && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Joined: {formatDate(node.joined_at)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge className={nodeTypeColors[node.node_type] || 'bg-gray-100 text-gray-700'}>
                                            {node.node_type.replace('_', ' ')}
                                        </Badge>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{formatCurrency(node.stake_amount)} ICL</p>
                                            <p className="text-xs text-gray-500">Staked</p>
                                        </div>
                                        {node.voting_power !== undefined && (
                                            <div className="text-right px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                                                <p className="font-bold text-amber-700">{node.voting_power}%</p>
                                                <p className="text-xs text-amber-600">Voting Power</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
