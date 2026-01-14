import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Code, Clock, RefreshCw, FileText, ChevronRight, Layers } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { governanceApi, l2Api } from '../lib/api';
import { formatDate, cn } from '../lib/utils';
import type { DeveloperApplication, L2, Vote as VoteType } from '../types';
import * as Tabs from '@radix-ui/react-tabs';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    ACTIVE: 'success',
    SUSPENDED: 'danger',
};

export default function DeveloperApplications() {
    const [activeTab, setActiveTab] = useState('pending');

    // Fetch pending developer applications
    const { data: pendingData, isLoading: isPendingLoading, refetch: refetchPending } = useQuery({
        queryKey: ['pending-developer-applications'],
        queryFn: governanceApi.getPendingDeveloperApplications,
    });

    // Fetch user's L2 applications
    const { data: myL2sData, isLoading: isMyL2sLoading, refetch: refetchMyL2s } = useQuery({
        queryKey: ['my-l2s'],
        queryFn: l2Api.getMyL2s,
    });

    // Fetch active votes
    const { data: votesData } = useQuery({
        queryKey: ['active-votes'],
        queryFn: governanceApi.getActiveVotes,
    });

    const pendingApplications: DeveloperApplication[] = pendingData?.data || [];
    const myL2s: L2[] = myL2sData?.data || [];
    const activeVotes: VoteType[] = votesData?.data || [];

    // Get vote for an application
    const getVoteForApplication = (applicationId: string) => {
        return activeVotes.find(v => v.subject_id === applicationId);
    };

    const refetchAll = () => {
        refetchPending();
        refetchMyL2s();
    };

    const DeveloperAppCard = ({ application }: { application: DeveloperApplication }) => {
        const vote = getVoteForApplication(application.application_id);

        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                                <Code className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Developer Application</p>
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
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-500">Business Plan</span>
                            <p className="text-gray-700 line-clamp-2">{application.business_plan}</p>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Expected Volume</span>
                            <span className="font-medium text-gray-900">
                                {application.expected_volume?.toLocaleString()} tx/month
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Submitted</span>
                            <span className="text-gray-700">
                                {formatDate(application.submitted_at)}
                            </span>
                        </div>
                    </div>

                    {vote && (
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

    const L2Card = ({ l2 }: { l2: L2 }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{l2.l2_id}</p>
                            <p className="text-sm text-gray-500">{l2.chaincode_name}</p>
                        </div>
                    </div>
                    <Badge variant={statusVariants[l2.status] || 'default'}>
                        {l2.status}
                    </Badge>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Base Fee</span>
                        <span className="font-medium text-gray-900">{l2.base_fee} ICL</span>
                    </div>
                    {l2.profit_sharing && (
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-500">Profit Sharing</span>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                <span className="text-gray-600">Developer: {l2.profit_sharing.developer_share}%</span>
                                <span className="text-gray-600">Validator: {l2.profit_sharing.validator_share}%</span>
                                <span className="text-gray-600">Full Node: {l2.profit_sharing.fullnode_share}%</span>
                                <span className="text-gray-600">Protocol: {l2.profit_sharing.protocol_share}%</span>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span className="text-gray-700">{formatDate(l2.created_at)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Developer Applications</h1>
                    <p className="text-gray-500 mt-1">View and manage L2 developer applications</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={refetchAll}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button asChild>
                        <a href="/l2/register">
                            <Layers className="h-4 w-4 mr-2" />
                            Register L2
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
                        value="my-l2s"
                        className={cn(
                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                            activeTab === 'my-l2s'
                                ? "border-primary-500 text-primary-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            My L2 Applications
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
                                <p className="text-gray-500">There are no developer applications awaiting approval.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingApplications.map((app) => (
                                <DeveloperAppCard key={app.application_id} application={app} />
                            ))}
                        </div>
                    )}
                </Tabs.Content>

                {/* My L2s Tab */}
                <Tabs.Content value="my-l2s">
                    {isMyL2sLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                        </div>
                    ) : myL2s.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Layers className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No L2 applications yet</h3>
                                <p className="text-gray-500 mb-4">You haven't registered any L2 applications.</p>
                                <Button asChild>
                                    <a href="/l2/register">Register L2</a>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myL2s.map((l2) => (
                                <L2Card key={l2.l2_id} l2={l2} />
                            ))}
                        </div>
                    )}
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
}

