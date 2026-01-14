import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Server, Plus, Activity, Vote, Power, PowerOff, RefreshCw, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { nodeApi, governanceApi } from '../lib/api';
import { formatDate, formatCurrency, cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { NodeApplication, Vote as VoteType, Node } from '../types';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    ACTIVE: 'success',
    INACTIVE: 'default',
    APPROVED: 'success',
    REJECTED: 'danger',
};

export default function NodeDashboard() {
    const queryClient = useQueryClient();
    const { hasWalletType } = useAuth();
    const { showToast } = useToast();

    // Fetch my nodes
    const { data: nodesData, isLoading: loadingNodes, refetch: refetchNodes } = useQuery({
        queryKey: ['my-nodes'],
        queryFn: nodeApi.getMyNodes,
        enabled: hasWalletType('NODE_WALLET'),
    });

    // Fetch my applications
    const { data: applicationsData, isLoading: loadingApps } = useQuery({
        queryKey: ['my-node-applications'],
        queryFn: nodeApi.getMyApplications,
    });

    // Fetch active nodes in network
    const { data: activeNodesData } = useQuery({
        queryKey: ['active-nodes'],
        queryFn: nodeApi.getActiveNodes,
    });

    // Fetch active votes
    const { data: activeVotesData } = useQuery({
        queryKey: ['active-votes'],
        queryFn: governanceApi.getActiveVotes,
        enabled: hasWalletType('NODE_WALLET'),
    });

    const myNodes: Node[] = nodesData?.data || [];
    const applications: NodeApplication[] = applicationsData?.data || [];
    const activeNodes = activeNodesData?.data || [];
    const activeVotes: VoteType[] = activeVotesData?.data || [];

    // Activate/Deactivate mutations
    const activateMutation = useMutation({
        mutationFn: (nodeId: string) => nodeApi.activateNode(nodeId),
        onSuccess: (response) => {
            if (response.success) {
                showToast('Node activated successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['my-nodes'] });
            } else {
                showToast(response.error || 'Failed to activate node', 'error');
            }
        },
        onError: (err: Error) => {
            showToast(err.message || 'Failed to activate node', 'error');
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: (nodeId: string) => nodeApi.deactivateNode(nodeId),
        onSuccess: (response) => {
            if (response.success) {
                showToast('Node deactivated successfully', 'success');
                queryClient.invalidateQueries({ queryKey: ['my-nodes'] });
            } else {
                showToast(response.error || 'Failed to deactivate node', 'error');
            }
        },
        onError: (err: Error) => {
            showToast(err.message || 'Failed to deactivate node', 'error');
        },
    });



    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Node Management</h1>
                    <p className="text-gray-500 mt-1">Manage your node applications and view network status</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => refetchNodes()}>
                        <RefreshCw className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    {hasWalletType('REGULAR') && (
                        <Link to="/nodes/apply">
                            <Button>
                                <Plus className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Apply to Become Node</span>
                                <span className="sm:hidden">Apply</span>
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="h-full">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-100 flex-shrink-0">
                                <Server className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">My Nodes</p>
                                <p className="text-xl sm:text-2xl font-bold">{myNodes.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-100 flex-shrink-0">
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">Applications</p>
                                <p className="text-xl sm:text-2xl font-bold">{applications.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-green-100 flex-shrink-0">
                                <Server className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">Network Nodes</p>
                                <p className="text-xl sm:text-2xl font-bold">{activeNodes.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-100 flex-shrink-0">
                                <Vote className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500">Pending Votes</p>
                                <p className="text-xl sm:text-2xl font-bold">{activeVotes.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Nodes */}
            {hasWalletType('NODE_WALLET') && (
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">My Active Nodes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingNodes ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                                </div>
                            ) : myNodes.length === 0 ? (
                                <div className="text-center py-8">
                                    <Server className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="text-gray-500">No nodes found.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myNodes.map((node) => (
                                        <div
                                            key={node.node_id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    'p-2.5 rounded-xl',
                                                    node.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'
                                                )}>
                                                    <Server className={cn(
                                                        'h-5 w-5',
                                                        node.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'
                                                    )} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{node.node_id}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={node.node_type === 'VALIDATOR' ? 'primary' : 'default'}>
                                                            {node.node_type}
                                                        </Badge>
                                                        <span className="text-sm text-gray-500">
                                                            Stake: {formatCurrency(node.stake_amount)} ICL
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge variant={statusVariants[node.status] || 'default'}>
                                                    {node.status}
                                                </Badge>

                                                {node.status === 'ACTIVE' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => deactivateMutation.mutate(node.node_id)}
                                                        isLoading={deactivateMutation.isPending}
                                                    >
                                                        <PowerOff className="h-4 w-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">Deactivate</span>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => activateMutation.mutate(node.node_id)}
                                                        isLoading={activateMutation.isPending}
                                                    >
                                                        <Power className="h-4 w-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">Activate</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* My Applications */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">My Node Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingApps ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-8">
                            <Server className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications</h3>
                            <p className="text-gray-500 mb-4">You haven't applied to become a node yet.</p>
                            {hasWalletType('REGULAR') && (
                                <Link to="/nodes/apply">
                                    <Button>Apply Now</Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {applications.map((app) => (
                                <div
                                    key={app.application_id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 gap-3"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-purple-100 flex-shrink-0">
                                            <Server className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {app.node_type.replace('_', ' ')}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                                                <span>Stake: {formatCurrency(app.requested_stake)} ICL</span>
                                                <span>•</span>
                                                <span>Applied: {formatDate(app.submitted_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={statusVariants[app.status] || 'default'}>
                                        {app.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Active Votes Quick View */}
            {hasWalletType('NODE_WALLET') && activeVotes.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Active Governance Votes</CardTitle>
                        <Link to="/voting">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activeVotes.slice(0, 3).map((vote) => (
                                <div
                                    key={vote.vote_id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-100"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {vote.vote_type.replace(/_/g, ' ')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Ends: {formatDate(vote.voting_end)}
                                        </p>
                                    </div>
                                    <Link to="/voting">
                                        <Button variant="outline" size="sm">Vote</Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info box for non-node operators */}
            {!hasWalletType('NODE_WALLET') && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-800">Want to become a node operator?</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Apply to become a Validator (10,000 ICL stake) or Full Node (3,500 ICL stake) to participate in network governance.
                        </p>
                        {hasWalletType('REGULAR') && (
                            <Link to="/nodes/apply" className="inline-block mt-2">
                                <Button size="sm">Apply Now</Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
