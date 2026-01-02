import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Server, Plus, Activity, Vote } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { nodeApi, governanceApi } from '../lib/api';
import { formatDate, formatCurrency } from '../lib/utils';
import type { NodeApplication, Vote as VoteType } from '../types';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    ACTIVE: 'success',
    APPROVED: 'success',
    REJECTED: 'danger',
};

export default function NodeDashboard() {
    const { data: applicationsData, isLoading: loadingApps } = useQuery({
        queryKey: ['my-node-applications'],
        queryFn: nodeApi.getMyApplications,
    });

    const { data: activeNodesData } = useQuery({
        queryKey: ['active-nodes'],
        queryFn: nodeApi.getActiveNodes,
    });

    const { data: activeVotesData } = useQuery({
        queryKey: ['active-votes'],
        queryFn: governanceApi.getActiveVotes,
    });

    const applications: NodeApplication[] = applicationsData?.data?.applications || [];
    const activeNodes = activeNodesData?.data?.nodes || [];
    const activeVotes: VoteType[] = activeVotesData?.data?.votes || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Node Management</h1>
                    <p className="text-gray-500 mt-1">Manage your node applications and view network status</p>
                </div>
                <Link to="/nodes/apply">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Apply to Become Node
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="p-3 rounded-lg bg-purple-100">
                            <Server className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Nodes</p>
                            <p className="text-2xl font-bold">{activeNodes.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="p-3 rounded-lg bg-blue-100">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">My Applications</p>
                            <p className="text-2xl font-bold">{applications.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="p-3 rounded-lg bg-amber-100">
                            <Vote className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Votes</p>
                            <p className="text-2xl font-bold">{activeVotes.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* My Applications */}
            <Card>
                <CardHeader>
                    <CardTitle>My Node Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingApps ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-8">
                            <Server className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No applications</h3>
                            <p className="text-gray-500 mb-4">You haven't applied to become a node yet.</p>
                            <Link to="/nodes/apply">
                                <Button>Apply Now</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <div
                                    key={app.application_id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-purple-100">
                                            <Server className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{app.node_type.replace('_', ' ')}</p>
                                            <p className="text-sm text-gray-500">Applied: {formatDate(app.created_at)}</p>
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
            {activeVotes.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Active Governance Votes</CardTitle>
                        <Link to="/voting">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activeVotes.slice(0, 3).map((vote) => (
                                <div
                                    key={vote.vote_id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                                >
                                    <div>
                                        <p className="font-medium">{vote.vote_type.replace('_', ' ')}</p>
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
        </div>
    );
}
