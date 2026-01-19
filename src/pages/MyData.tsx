import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FileText, Share2, Download, Lock, Unlock, Eye, Copy, CheckCircle,
    Search, User, X, Mail, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatDate, copyToClipboard } from '../lib/utils';
import { fileApi } from '../lib/api';
import type { FileInfo } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as Dialog from '@radix-ui/react-dialog';

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function MyData() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [sharePin, setSharePin] = useState('');
    const [sharePermission, setSharePermission] = useState<'read' | 'write' | 'read-write'>('read');
    const [isSharing, setIsSharing] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'my-files' | 'shared'>('my-files');

    const { wallets } = useAuth();
    const { showToast } = useToast();

    // Fetch my files from API
    const { data: myFilesData, isLoading: isLoadingMyFiles, refetch: refetchMyFiles } = useQuery({
        queryKey: ['my-files'],
        queryFn: fileApi.getMyFiles,
    });

    // Fetch files shared with me
    const { data: sharedFilesData, isLoading: isLoadingShared, refetch: refetchShared } = useQuery({
        queryKey: ['shared-with-me'],
        queryFn: fileApi.getSharedWithMe,
    });

    const myFiles: FileInfo[] = myFilesData?.data || [];
    const sharedFiles: FileInfo[] = sharedFilesData?.data || [];
    const isLoading = activeTab === 'my-files' ? isLoadingMyFiles : isLoadingShared;
    const files = activeTab === 'my-files' ? myFiles : sharedFiles;

    // Get user's regular wallet address
    const regularWallet = wallets?.find((w) => w.wallet_type === 'REGULAR');
    const ownerWalletAddress = regularWallet?.wallet_address || '';

    // Filter files based on search
    const filteredFiles = files.filter(file => {
        const searchLower = searchQuery.toLowerCase();
        const fileName = file.file_name?.toLowerCase() || '';
        const ipfsCid = file.ipfs_cid?.toLowerCase() || '';
        const description = typeof file.metadata?.description === 'string'
            ? file.metadata.description.toLowerCase()
            : '';
        return fileName.includes(searchLower) ||
               ipfsCid.includes(searchLower) ||
               description.includes(searchLower);
    });

    const handleRefresh = () => {
        refetchMyFiles();
        refetchShared();
    };

    const handleCopy = async (text: string, field: string) => {
        const success = await copyToClipboard(text);
        if (success) {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        }
    };

    const handleShare = async () => {
        if (!selectedFile || !shareEmail || !sharePin || !ownerWalletAddress) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        setIsSharing(true);
        try {
            const result = await fileApi.shareFileAccess({
                tx_id: selectedFile.tx_id,
                owner_wallet_address: ownerWalletAddress,
                recipient_email: shareEmail,
                permission: sharePermission,
                pin: sharePin,
            });

            if (result.success) {
                showToast(`File shared with ${shareEmail} successfully!`, 'success');
                setShareEmail('');
                setSharePin('');
                setSharePermission('read');
                setShowShareModal(false);
                refetchMyFiles();
            } else {
                showToast(result.error || 'Failed to share file', 'error');
            }
        } catch {
            showToast('Failed to share file. Please check your PIN and try again.', 'error');
        } finally {
            setIsSharing(false);
        }
    };

    const getDescription = (file: FileInfo): string => {
        if (file.metadata?.description && typeof file.metadata.description === 'string') {
            return file.metadata.description;
        }
        return '';
    };

    const getTags = (file: FileInfo): string[] => {
        if (file.metadata?.tags && Array.isArray(file.metadata.tags)) {
            return file.metadata.tags as string[];
        }
        return [];
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Data</h1>
                    <p className="text-gray-500 mt-1">View and manage your submitted files on the blockchain</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Badge variant="default" className="px-3 py-1.5">
                        <FileText className="h-4 w-4 mr-1" />
                        {myFiles.length} Files
                    </Badge>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('my-files')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'my-files'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FileText className="inline h-4 w-4 mr-2" />
                    My Files ({myFiles.length})
                </button>
                <button
                    onClick={() => setActiveTab('shared')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'shared'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Share2 className="inline h-4 w-4 mr-2" />
                    Shared With Me ({sharedFiles.length})
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search files by name, CID, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{myFiles.length}</p>
                                <p className="text-sm text-gray-500">Total Files</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Lock className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {myFiles.filter(f => f.is_private).length}
                                </p>
                                <p className="text-sm text-gray-500">Private Files</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Share2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {sharedFiles.length}
                                </p>
                                <p className="text-sm text-gray-500">Shared With Me</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Files List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        {activeTab === 'my-files' ? 'My Files' : 'Shared With Me'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">
                                {activeTab === 'my-files' ? 'No files found' : 'No files shared with you yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.tx_id}
                                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                                    onClick={() => setSelectedFile(file)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className={`p-2.5 rounded-xl ${file.is_private ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                {file.is_private ? (
                                                    <Lock className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <Unlock className="h-5 w-5 text-gray-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{file.file_name}</p>
                                                <p className="text-sm text-gray-500 truncate font-mono">{file.ipfs_cid}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                    {file.file_size && (
                                                        <React.Fragment>
                                                            <span>{formatFileSize(file.file_size)}</span>
                                                            <span>•</span>
                                                        </React.Fragment>
                                                    )}
                                                    <span>{formatDate(file.created_at)}</span>
                                                    {file.shared_with && file.shared_with.length > 0 && (
                                                        <React.Fragment>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 text-purple-600">
                                                                <Share2 className="h-3 w-3" />
                                                                Shared with {file.shared_with.length}
                                                            </span>
                                                        </React.Fragment>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={file.is_private ? 'success' : 'default'}>
                                                {file.is_private ? 'Private' : 'Public'}
                                            </Badge>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* File Detail Modal */}
            <Dialog.Root open={!!selectedFile && !showShareModal} onOpenChange={(open) => !open && setSelectedFile(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-2xl z-50 max-h-[90vh] overflow-hidden animate-scale-in">
                        {selectedFile && (
                            <React.Fragment>
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${selectedFile.is_private ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                {selectedFile.is_private ? (
                                                    <Lock className="h-6 w-6 text-green-600" />
                                                ) : (
                                                    <Unlock className="h-6 w-6 text-gray-600" />
                                                )}
                                            </div>
                                            <div>
                                                <Dialog.Title className="text-xl font-bold text-gray-900">
                                                    {selectedFile.file_name}
                                                </Dialog.Title>
                                                {selectedFile.file_size && (
                                                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.file_size)}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant={selectedFile.is_private ? 'success' : 'default'}>
                                            {selectedFile.is_private ? 'Private' : 'Public'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
                                    {/* CID */}
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">IPFS CID</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono truncate">
                                                {selectedFile.ipfs_cid}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(selectedFile.ipfs_cid, 'cid')}
                                            >
                                                {copiedField === 'cid' ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Transaction ID */}
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono truncate">
                                                {selectedFile.tx_id}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(selectedFile.tx_id, 'tx_id')}
                                            >
                                                {copiedField === 'tx_id' ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {getDescription(selectedFile) && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Description</p>
                                            <p className="text-gray-700">{getDescription(selectedFile)}</p>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {getTags(selectedFile).length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Tags</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {getTags(selectedFile).map((tag, i) => (
                                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Owner Info */}
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Owner Wallet</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono truncate">
                                                {selectedFile.owner_wallet}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopy(selectedFile.owner_wallet, 'owner')}
                                            >
                                                {copiedField === 'owner' ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Shared With */}
                                    {selectedFile.shared_with && selectedFile.shared_with.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Shared With</p>
                                            <div className="space-y-2">
                                                {selectedFile.shared_with.map((share, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-purple-600" />
                                                            <code className="text-sm font-mono text-purple-700">{share.wallet_address}</code>
                                                            <Badge variant="default" className="text-xs">{share.permission}</Badge>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{formatDate(share.granted_at)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {selectedFile.l2_id && (
                                            <div>
                                                <p className="text-gray-500">L2 ID</p>
                                                <p className="font-medium font-mono text-xs">{selectedFile.l2_id}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-500">Created</p>
                                            <p className="font-medium">{formatDate(selectedFile.created_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Access Type</p>
                                            <p className="font-medium capitalize">{selectedFile.access_type || 'Owner'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                                    {selectedFile.is_private && selectedFile.access_type === 'owner' && (
                                        <Button
                                            variant="primary"
                                            className="flex-1"
                                            onClick={() => setShowShareModal(true)}
                                        >
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share File
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            if (!selectedFile.is_private) {
                                                window.open(`https://ipfs.io/ipfs/${selectedFile.ipfs_cid}`, '_blank');
                                            } else {
                                                showToast('Private file download requires PIN. Feature coming soon.', 'info');
                                            }
                                        }}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        {selectedFile.is_private ? 'Download (PIN Required)' : 'Download'}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setSelectedFile(null)}>
                                        Close
                                    </Button>
                                </div>
                            </React.Fragment>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Share Modal */}
            <Dialog.Root open={showShareModal} onOpenChange={setShowShareModal}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-md z-50 overflow-hidden animate-scale-in">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <Dialog.Title className="text-xl font-bold text-gray-900">
                                    Share File
                                </Dialog.Title>
                                <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">File</p>
                                <p className="font-medium text-gray-900">{selectedFile?.file_name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="inline h-4 w-4 mr-1" />
                                    Recipient Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="recipient@example.com"
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    The encryption key will be re-encrypted for this user&apos;s wallet
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Permission Level
                                </label>
                                <select
                                    value={sharePermission}
                                    onChange={(e) => setSharePermission(e.target.value as 'read' | 'write' | 'read-write')}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="read">Read only</option>
                                    <option value="write">Write</option>
                                    <option value="read-write">Read &amp; Write</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your PIN (for authorization)
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your PIN"
                                    value={sharePin}
                                    onChange={(e) => setSharePin(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest text-lg"
                                />
                            </div>

                            <div className="p-4 bg-amber-50 rounded-xl">
                                <p className="text-sm text-amber-800">
                                    <strong>Note:</strong> Sharing this file will decrypt your encryption key using your PIN,
                                    then re-encrypt it for the recipient. This action is recorded on the blockchain.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleShare}
                                disabled={!shareEmail || sharePin.length < 4 || isSharing}
                            >
                                {isSharing ? (
                                    <span>Sharing...</span>
                                ) : (
                                    <span className="flex items-center">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share Access
                                    </span>
                                )}
                            </Button>
                            <Button variant="outline" onClick={() => setShowShareModal(false)}>
                                Cancel
                            </Button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}

