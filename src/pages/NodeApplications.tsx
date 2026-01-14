import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Clock, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { governanceApi, nodeApi } from '../lib/api';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import type { NodeApplication, Vote as VoteType } from '../types';
import * as Tabs from '@radix-ui/react-tabs';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
};

export default function NodeApplications() {
    const [activeTab, setActiveTab] = useState('pending');

    // Fetch pending node applications
    const { data: pendingData, isLoading: isPendingLoading, refetch: refetchPending } = useQuery({
        queryKey: ['pending-node-applications'],
        queryFn: governanceApi.getPendingNodeApplications,
    });

    // Fetch user's own applications
    const { data: myAppsData, isLoading: isMyAppsLoading, refetch: refetchMyApps } = useQuery({
        queryKey: ['my-node-applications'],
        queryFn: nodeApi.getMyApplications,
    });

    // Fetch active votes
    const { data: votesData } = useQuery({
        queryKey: ['active-votes'],
        queryFn: governanceApi.getActiveVotes,
    });

    const pendingApplications: NodeApplication[] = pendingData?.data || [];
    const myApplications: NodeApplication[] = myAppsData?.data || [];
    const activeVotes: VoteType[] = votesData?.data || [];

    // Get vote for an application
    const getVoteForApplication = (applicationId: string) => {
        return activeVotes.find(v => v.subject_id === applicationId);
    };

    const refetchAll = () => {
        refetchPending();
        refetchMyApps();
    };

    const ApplicationCard = ({ application, showVoteLink = false }: { application: NodeApplication; showVoteLink?: boolean }) => {
        const vote = getVoteForApplication(application.application_id);

        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2.5 rounded-xl",
                                application.node_type === 'VALIDATOR'
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-blue-100 text-blue-600"
                            )}>
                                <Server className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{application.node_type}</p>
                                <p className="text-sm text-gray-500 font-mono truncate max-w-[200px]">
                                    {application.application_id.slice(0, 12)}...
                                </p>
                            </div>
                        </div>
                        <Badge variant={statusVariants[application.status] || 'default'}>
                            {application.status}
                        </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Stake Amount</span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(application.requested_stake)} ICL
                            </span>
                        </div>
                        {application.endpoint && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Endpoint</span>
                                <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">
                                    {application.endpoint}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">Submitted</span>
                            <span className="text-gray-700">
                                {formatDate(application.submitted_at)}
                            </span>
                        </div>
                    </div>

                    {vote && showVoteLink && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <a
                                href="/voting"
                                className="flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
                            >
                                <div className="flex items-center gap-2 text-amber-700">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm font-medium">Active Vote</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-amber-600" />
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Node Applications</h1>
                    <p className="text-gray-500 mt-1">View and manage node applications</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={refetchAll}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button asChild>
                        <a href="/nodes/apply">
                            <Server className="h-4 w-4 mr-2" />
                            Apply for Node
                        </a>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex border-b border-gray-200 mb-6">
                    <Tabs.Trigger
                        value="pending"
                        className={cn(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                            activeTab === 'pending'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending Applications
                            {pendingApplications.length > 0 && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                                    {pendingApplications.length}
                                </span>
                            )}
                        </div>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="my-applications"
                        className={cn(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                            activeTab === 'my-applications'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            My Applications
                        </div>
                    </Tabs.Trigger>
                </Tabs.List>

                {/* Pending Applications Tab */}
                <Tabs.Content value="pending">
                    {isPendingLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                        </div>
                    ) : pendingApplications.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No pending applications</h3>
                                <p className="text-gray-500">There are no node applications awaiting approval.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingApplications.map((app) => (
                                <ApplicationCard
                                    key={app.application_id}
                                    application={app}
                                    showVoteLink={true}
                                />
                            ))}
                        </div>
                    )}
                </Tabs.Content>

                {/* My Applications Tab */}
                <Tabs.Content value="my-applications">
                    {isMyAppsLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                        </div>
                    ) : myApplications.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Server className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
                                <p className="text-gray-500 mb-4">You haven't submitted any node applications.</p>
                                <Button asChild>
                                    <a href="/nodes/apply">Apply Now</a>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myApplications.map((app) => (
                                <ApplicationCard
                                    key={app.application_id}
                                    application={app}
                                    showVoteLink={app.status === 'PENDING'}
                                />
                            ))}
                        </div>
                    )}
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
}

