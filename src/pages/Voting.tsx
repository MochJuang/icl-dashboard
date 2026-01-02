import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Vote, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { governanceApi } from '../lib/api';
import { formatDate, calculateVoteProgress } from '../lib/utils';
import { VOTE_TYPE_LABELS } from '../lib/constants';
import type { Vote as VoteType } from '../types';
import * as Dialog from '@radix-ui/react-dialog';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    EXPIRED: 'default',
};

export default function Voting() {
    const queryClient = useQueryClient();
    const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['active-votes'],
        queryFn: governanceApi.getActiveVotes,
    });

    const votes: VoteType[] = data?.data?.votes || [];

    const castVoteMutation = useMutation({
        mutationFn: (data: { vote_id: string; decision: 'APPROVE' | 'REJECT'; pin: string }) =>
            governanceApi.castVote({
                vote_id: data.vote_id,
                node_id: '', // This should come from user's node
                decision: data.decision,
                pin: data.pin,
            }),
        onSuccess: (response) => {
            if (response.success) {
                setSelectedVote(null);
                setPin('');
                queryClient.invalidateQueries({ queryKey: ['active-votes'] });
            } else {
                setError(response.error || 'Failed to cast vote');
            }
        },
        onError: (err: Error) => {
            setError(err.message || 'Failed to cast vote');
        },
    });

    const handleVote = (decision: 'APPROVE' | 'REJECT') => {
        if (!selectedVote || pin.length !== 6) return;
        setError('');
        castVoteMutation.mutate({
            vote_id: selectedVote.vote_id,
            decision,
            pin,
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Governance Voting</h1>
                    <p className="text-gray-500 mt-1">Participate in network governance decisions</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    Refresh
                </Button>
            </div>

            {/* Vote List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : votes.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Vote className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No active votes</h3>
                        <p className="text-gray-500">There are no governance proposals to vote on right now.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {votes.map((vote) => {
                        const validatorProgress = calculateVoteProgress(vote.validator_approve, vote.validator_reject);
                        const fullnodeProgress = calculateVoteProgress(vote.fullnode_approve, vote.fullnode_reject);
                        const isExpired = new Date(vote.voting_end) < new Date();

                        return (
                            <Card key={vote.vote_id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-amber-100">
                                                <Vote className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {VOTE_TYPE_LABELS[vote.vote_type] || vote.vote_type}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500">
                                                    Subject: {vote.subject_name || vote.subject_id}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={statusVariants[vote.status] || 'default'}>
                                            {vote.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Voting Progress */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600">Validators ({vote.validator_approve + vote.validator_reject}/{vote.total_validators})</span>
                                                <span className="font-medium">{validatorProgress}% approve</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${validatorProgress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-gray-600">Full Nodes ({vote.fullnode_approve + vote.fullnode_reject}/{vote.total_fullnodes})</span>
                                                <span className="font-medium">{fullnodeProgress}% approve</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${fullnodeProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time and Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            {isExpired ? 'Ended' : 'Ends'}: {formatDate(vote.voting_end)}
                                        </div>

                                        {!isExpired && vote.status === 'PENDING' && !vote.my_vote && (
                                            <Button onClick={() => setSelectedVote(vote)}>
                                                Cast Vote
                                            </Button>
                                        )}

                                        {vote.my_vote && (
                                            <Badge variant={vote.my_vote === 'APPROVE' ? 'success' : 'danger'}>
                                                You voted: {vote.my_vote}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Vote Modal */}
            <Dialog.Root open={!!selectedVote} onOpenChange={(open) => !open && setSelectedVote(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 w-full max-w-md z-50">
                        <Dialog.Title className="text-lg font-semibold mb-4">
                            Cast Your Vote
                        </Dialog.Title>

                        {selectedVote && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-gray-50">
                                    <p className="text-sm text-gray-500">Voting on</p>
                                    <p className="font-medium">{VOTE_TYPE_LABELS[selectedVote.vote_type]}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedVote.subject_name || selectedVote.subject_id}
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <Input
                                    label="Enter PIN to Vote"
                                    type="password"
                                    maxLength={6}
                                    placeholder="Enter 6-digit PIN"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                        onClick={() => handleVote('REJECT')}
                                        isLoading={castVoteMutation.isPending}
                                        disabled={pin.length !== 6}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={() => handleVote('APPROVE')}
                                        isLoading={castVoteMutation.isPending}
                                        disabled={pin.length !== 6}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
