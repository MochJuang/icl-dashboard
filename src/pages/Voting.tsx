import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { Vote, CheckCircle, XCircle, Clock, AlertCircle, Info, ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { governanceApi, nodeApi } from '../lib/api';
import { calculateVoteProgress, getTimeRemaining, cn } from '../lib/utils';
import { VOTE_TYPE_LABELS } from '../lib/constants';
import { useAuth } from '../context/AuthContext';
import type { Node, WalletInfo } from '../types';
import * as Dialog from '@radix-ui/react-dialog';

// Vote list item (minimal response from API)
interface VoteListItem {
    vote_id: string;
    vote_type: string;
    status: string;
    voted_at?: string;
}

// Vote detail (full response from API)
interface VoteDetail {
    vote_id: string;
    vote_type: string;
    subject_id: string;
    subject_name?: string;
    status: string;
    validator_approve: number;
    validator_reject: number;
    fullnode_approve: number;
    fullnode_reject: number;
    total_validators: number;
    total_fullnodes: number;
    // Support both API and mock data field names
    validator_total?: number;
    fullnode_total?: number;
    voting_end?: string;
    expires_at: string;
    submitted_at: string;
    my_vote?: string;
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    EXPIRED: 'default',
};

export default function Voting() {
    const queryClient = useQueryClient();
    const { getNodeWallets, hasWalletType, refreshWallets } = useAuth();

    const [selectedVote, setSelectedVote] = useState<VoteDetail | null>(null);
    const [selectedNodeWallet, setSelectedNodeWallet] = useState<WalletInfo | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [showWalletSelector, setShowWalletSelector] = useState(false);

    // Get node wallets
    const nodeWallets = useMemo(() => getNodeWallets(), [getNodeWallets]);

    // Fetch active votes list
    const { data: votesListData, isLoading: isListLoading, refetch } = useQuery({
        queryKey: ['active-votes'],
        queryFn: governanceApi.getActiveVotes,
    });

    const votesList: VoteListItem[] = votesListData?.data || [];

    // Fetch details for each vote
    const voteDetailQueries = useQueries({
        queries: votesList.map((vote) => ({
            queryKey: ['vote-detail', vote.vote_id],
            queryFn: () => governanceApi.getVote(vote.vote_id),
            enabled: !!vote.vote_id,
            staleTime: 30000,
        })),
    });

    // Combine vote details
    const votes: VoteDetail[] = voteDetailQueries
        .filter((q) => q.isSuccess && q.data?.data)
        .map((q) => q.data.data);

    const isLoading = isListLoading || voteDetailQueries.some((q) => q.isLoading);

    // Fetch user's nodes
    const { data: nodesData } = useQuery({
        queryKey: ['my-nodes'],
        queryFn: nodeApi.getMyNodes,
        enabled: hasWalletType('NODE_WALLET'),
    });

    const myNodes: Node[] = nodesData?.data || [];

    // Cast vote mutation
    const castVoteMutation = useMutation({
        mutationFn: (data: {
            wallet_address: string;
            vote_id: string;
            node_id: string;
            decision: 'APPROVE' | 'REJECT';
            pin: string;
        }) =>
            governanceApi.castVote({
                wallet_address: data.wallet_address,
                pin: data.pin,
                vote: {
                    vote_id: data.vote_id,
                    node_id: data.node_id,
                    decision: data.decision,
                },
            }),
        onSuccess: async (response) => {
            if (response.success) {
                setSelectedVote(null);
                setSelectedNodeWallet(null);
                setSelectedNode(null);
                setPin('');
                setError('');

                // Refresh wallets to get updated balances
                try {
                    await refreshWallets();
                } catch (error) {
                    console.error('Failed to refresh wallets after vote:', error);
                }

                // Refresh vote data
                queryClient.invalidateQueries({ queryKey: ['active-votes'] });
                votesList.forEach((v) => {
                    queryClient.invalidateQueries({ queryKey: ['vote-detail', v.vote_id] });
                });
            } else {
                setError(response.error || 'Failed to cast vote');
            }
        },
        onError: (err: Error & { response?: { data?: { error?: string } } }) => {
            setError(err.response?.data?.error || err.message || 'Failed to cast vote');
        },
    });

    const handleVote = (decision: 'APPROVE' | 'REJECT') => {
        if (!selectedVote || !selectedNodeWallet || !selectedNode || pin.length !== 6) {
            setError('Please select a node wallet and enter your PIN');
            return;
        }
        setError('');
        castVoteMutation.mutate({
            wallet_address: selectedNodeWallet.wallet_address,
            vote_id: selectedVote.vote_id,
            node_id: selectedNode.node_id,
            decision,
            pin,
        });
    };

    const openVoteModal = async (vote: VoteDetail) => {
        setSelectedVote(vote);
        setError('');
        setPin('');
        await refreshWallets();
        setSelectedNodeWallet(null);
        setSelectedNode(null);
        setShowWalletSelector(false);
    };

    const handleSelectNode = (node: Node) => {
        setSelectedNode(node);
        const wallet = nodeWallets.find((w) => w.wallet_id === node.node_wallet_id);
        console.log('Selecting node:', node);
        console.log('Found wallet:', nodeWallets);
        if (wallet) {
            setSelectedNodeWallet(wallet);
        } else {
            console.log('No wallet found for node wallet ID:', node.node_wallet_id);
        }


        setShowWalletSelector(false);
    };

    const canVote = hasWalletType('NODE_WALLET') && myNodes.length > 0;

    const hasVoted = (vote: VoteDetail | VoteListItem) => {
        if ('my_vote' in vote && vote.my_vote) return true;
        const listItem = votesList.find((v) => v.vote_id === vote.vote_id);
        return listItem?.voted_at && listItem.voted_at !== '0001-01-01T00:00:00Z';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Governance Voting</h1>
                    <p className="text-gray-500 font-medium">Participate in network governance decisions</p>
                </div>
                <Button variant="outline" onClick={() => refetch()} className="shrink-0">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Voting requirement notice */}
            {!canVote && (
                <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                        <Info className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-amber-800">Node Wallet Required</p>
                        <p className="text-sm text-amber-700 mt-1">
                            Only node operators can participate in governance voting.
                            {!hasWalletType('NODE_WALLET')
                                ? ' You need a NODE_WALLET to vote.'
                                : ' Your node needs to be active to vote.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Vote List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-4" />
                    <p className="text-gray-500 font-medium">Loading votes...</p>
                </div>
            ) : votes.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                            <Vote className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No active votes</h3>
                        <p className="text-gray-500 text-center max-w-sm">
                            There are no governance proposals to vote on right now. Check back later.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {votes.map((vote) => {
                        const validatorProgress = calculateVoteProgress(vote.validator_approve, vote.validator_total || vote.total_validators || 0);
                        const fullnodeProgress = calculateVoteProgress(vote.fullnode_approve, vote.fullnode_total || vote.total_fullnodes || 0);
                        const timeRemaining = getTimeRemaining(vote.submitted_at);
                        const isExpired = timeRemaining.expired;
                        const alreadyVoted = hasVoted(vote);

                        return (
                            <Card key={vote.vote_id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                {/* Card Header */}
                                <div className="p-5 pb-4 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2.5 bg-amber-100 rounded-xl shrink-0">
                                                <Vote className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {VOTE_TYPE_LABELS[vote.vote_type] || vote.vote_type}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate mt-0.5 font-mono">
                                                    {vote.subject_name || vote.subject_id}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={statusVariants[vote.status] || 'default'} className="shrink-0">
                                            {vote.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 space-y-5">
                                    {/* Voting Progress */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {/* Validators Progress */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Validators
                                                </span>
                                                <span className="text-sm font-semibold text-green-600">
                                                    {vote.validator_approve}/{vote.total_validators} ({validatorProgress}%)
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${validatorProgress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Full Nodes Progress */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Full Nodes
                                                </span>
                                                <span className="text-sm font-semibold text-blue-600">
                                                    {vote.fullnode_approve}/{vote.total_fullnodes} ({fullnodeProgress}%)
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${fullnodeProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer: Time and Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "p-1.5 rounded-lg",
                                                isExpired ? "bg-red-100" : "bg-gray-100"
                                            )}>
                                                <Clock className={cn(
                                                    "h-4 w-4",
                                                    isExpired ? "text-red-500" : "text-gray-500"
                                                )} />
                                            </div>
                                            {isExpired ? (
                                                <span className="text-sm font-medium text-red-600">Voting ended</span>
                                            ) : (
                                                <span className="text-sm text-gray-600">
                                                    <span className="font-medium text-gray-900">
                                                        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                                                        {timeRemaining.hours}h {timeRemaining.minutes}m
                                                    </span>
                                                    {' '}remaining
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {alreadyVoted && (
                                                <Badge
                                                    variant={vote.my_vote === 'APPROVE' ? 'success' : vote.my_vote === 'REJECT' ? 'danger' : 'default'}
                                                    className="px-3 py-1"
                                                >
                                                    {vote.my_vote ? `Voted: ${vote.my_vote}` : 'Already Voted'}
                                                </Badge>
                                            )}

                                            {!isExpired && vote.status === 'PENDING' && !alreadyVoted && canVote && (
                                                <Button
                                                    onClick={() => openVoteModal(vote)}
                                                    size="sm"
                                                    className="px-5"
                                                >
                                                    Cast Vote
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Vote Modal */}
            <Dialog.Root open={!!selectedVote} onOpenChange={(open) => !open && setSelectedVote(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-md z-50 max-h-[90vh] overflow-hidden animate-scale-in">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100">
                            <Dialog.Title className="text-xl font-bold text-gray-900">
                                Cast Your Vote
                            </Dialog.Title>
                            <p className="text-sm text-gray-500 mt-1">
                                Your vote will be recorded on the blockchain
                            </p>
                        </div>

                        {selectedVote && (
                            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                                {/* Vote info */}
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                        Voting on
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {VOTE_TYPE_LABELS[selectedVote.vote_type] || selectedVote.vote_type}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1 font-mono truncate">
                                        {selectedVote.subject_name || selectedVote.subject_id}
                                    </p>
                                </div>

                                {/* Node Wallet Selector */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Voting as Node
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowWalletSelector(!showWalletSelector)}
                                            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 hover:bg-gray-50 transition-all"
                                        >
                                            <div className="text-left">
                                                {selectedNode ? (
                                                    <>
                                                        <p className="font-semibold text-gray-900">{selectedNode.node_id}</p>
                                                        <p className="text-sm text-gray-500">{selectedNode.node_type}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-gray-500">Select a node</p>
                                                )}
                                            </div>
                                            <ChevronDown
                                                className={cn(
                                                    'h-5 w-5 text-gray-400 transition-transform duration-200',
                                                    showWalletSelector && 'rotate-180'
                                                )}
                                            />
                                        </button>

                                        {showWalletSelector && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                                {myNodes.map((node) => (
                                                    <button
                                                        key={node.node_id}
                                                        type="button"
                                                        onClick={() => handleSelectNode(node)}
                                                        className={cn(
                                                            'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl',
                                                            selectedNode?.node_id === node.node_id && 'bg-primary-50'
                                                        )}
                                                    >
                                                        <p className="font-semibold text-gray-900">{node.node_id}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {node.node_type} • {node.status}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Error message */}
                                {error && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                )}

                                {/* PIN Input */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Enter PIN to Confirm
                                    </label>
                                    <Input
                                        type="password"
                                        maxLength={6}
                                        placeholder="• • • • • •"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                        className="text-center text-xl tracking-[0.5em] font-mono h-12"
                                    />
                                    <p className="text-xs text-gray-500 text-center">
                                        Enter your 6-digit PIN to authorize this vote
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-11"
                                    onClick={() => handleVote('REJECT')}
                                    isLoading={castVoteMutation.isPending}
                                    disabled={pin.length !== 6 || !selectedNode}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    variant="success"
                                    className="h-11"
                                    onClick={() => handleVote('APPROVE')}
                                    isLoading={castVoteMutation.isPending}
                                    disabled={pin.length !== 6 || !selectedNode}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </Button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
