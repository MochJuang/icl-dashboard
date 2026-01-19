import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Plus, Eye, Key, FileText, Clock, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { l2Api } from '../lib/api';
import { formatCurrency, formatDate, copyToClipboard } from '../lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

interface L2Application {
    l2_id: string;
    name: string;
    description: string;
    developer_id: string;
    developer_name: string;
    gas_fee: number;
    status: string;
    document_link: string;
    created_at: string;
    updated_at?: string;
    approved_at?: string;
    fee_distribution: {
        min_fee: number;
        validator_share: number;
        fullnode_share: number;
        protocol_share: number;
        developer_margin: number;
    };
    basic_auth?: {
        username: string;
        api_key: string;
        generated_at: string;
    } | null;
    api_endpoint?: string;
}

// Mock transaction records for demo
interface MockTransaction {
    tx_id: string;
    type: string;
    timestamp: string;
    fee: number;
    status: string;
}

const mockTransactionRecords: MockTransaction[] = [
    // { tx_id: "dbb8460765696de373538aa2458f949bda8d5209c46161246c69f1ff251df89c", type: "SAVE_FILE", timestamp: "2026-01-15T15:00:00Z", fee: 2.0, status: "SUCCESS" },
    // { tx_id: "TX_002", type: "SAVE_FILE", timestamp: "2026-01-15T16:30:00Z", fee: 2.0, status: "SUCCESS" },
    // { tx_id: "TX_003", type: "GRANT_ACCESS", timestamp: "2026-01-15T17:00:00Z", fee: 0.5, status: "SUCCESS" },
    // { tx_id: "TX_004", type: "SAVE_FILE", timestamp: "2026-01-16T08:00:00Z", fee: 2.0, status: "SUCCESS" },
];

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
    PENDING: 'warning',
    ACTIVE: 'success',
    REJECTED: 'danger',
    SUSPENDED: 'danger',
};

export default function L2Dashboard() {
    const navigate = useNavigate();
    const [selectedL2, setSelectedL2] = useState<L2Application | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['my-l2s'],
        queryFn: l2Api.getMyL2s,
    });

    // Support both formats: data.data.l2s (API) and data.data (mock)
    const l2s: L2Application[] = data?.data?.l2s || data?.data || [];

    const handleCopy = async (text: string, field: string) => {
        const success = await copyToClipboard(text);
        if (success) {
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
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
                                        {l2.name}
                                    </CardTitle>
                                    <Badge variant={statusVariants[l2.status] || 'default'}>
                                        {l2.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-600 line-clamp-2">{l2.description}</p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">L2 ID</p>
                                        <p className="font-medium font-mono text-xs">{l2.l2_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Gas Fee</p>
                                        <p className="font-medium">{formatCurrency(l2.gas_fee)} ICL</p>
                                    </div>
                                </div>

                                {/* Fee Distribution */}
                                {l2.fee_distribution && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <p className="text-sm text-gray-500 mb-2">Fee Distribution</p>
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                Val: {l2.fee_distribution.validator_share} ICL
                                            </span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                Full: {l2.fee_distribution.fullnode_share} ICL
                                            </span>
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                                Proto: {l2.fee_distribution.protocol_share} ICL
                                            </span>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                Dev: {l2.fee_distribution.developer_margin} ICL
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Created: {formatDate(l2.created_at)}
                                    </span>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => navigate(`/l2/${l2.l2_id}`)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* L2 Detail Modal */}
            <Dialog.Root open={!!selectedL2} onOpenChange={(open) => !open && setSelectedL2(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-4xl z-50 max-h-[90vh] overflow-hidden animate-scale-in">
                        {selectedL2 && (
                            <>
                                {/* Modal Header */}
                                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-100 rounded-xl">
                                                <Layers className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <Dialog.Title className="text-xl font-bold text-gray-900">
                                                    {selectedL2.name}
                                                </Dialog.Title>
                                                <p className="text-sm text-gray-500 font-mono">{selectedL2.l2_id}</p>
                                            </div>
                                        </div>
                                        <Badge variant={statusVariants[selectedL2.status] || 'default'} className="text-sm px-3 py-1">
                                            {selectedL2.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                                    {/* Basic Auth Section - Only for ACTIVE L2 */}
                                    {selectedL2.status === 'ACTIVE' && selectedL2.basic_auth && (
                                        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Key className="h-5 w-5 text-green-600" />
                                                <h3 className="font-semibold text-green-800">API Credentials</h3>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-xs text-green-700 mb-1">Username</p>
                                                    <div className="flex items-center gap-2">
                                                        <code className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-mono border border-green-200">
                                                            {selectedL2.basic_auth.username}
                                                        </code>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(selectedL2.basic_auth!.username, 'username')}
                                                        >
                                                            {copiedField === 'username' ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-green-700 mb-1">Password</p>
                                                    <div className="flex items-center gap-2">
                                                        <code className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-mono border border-green-200">
                                                            {selectedL2.basic_auth.api_key}
                                                        </code>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleCopy(selectedL2.basic_auth!.api_key, 'api_key')}
                                                        >
                                                            {copiedField === 'api_key' ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {selectedL2.api_endpoint && (
                                                    <div>
                                                        <p className="text-xs text-green-700 mb-1">API Endpoint</p>
                                                        <div className="flex items-center gap-2">
                                                            <code className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-mono border border-green-200 truncate">
                                                                {selectedL2.api_endpoint}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopy(selectedL2.api_endpoint!, 'endpoint')}
                                                            >
                                                                {copiedField === 'endpoint' ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-xs text-green-600 mt-2">
                                                    Generated: {formatDate(selectedL2.basic_auth.generated_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pending Notice */}
                                    {selectedL2.status === 'PENDING' && (
                                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-amber-600" />
                                                <p className="text-amber-800 font-medium">Waiting for Governance Approval</p>
                                            </div>
                                            <p className="text-sm text-amber-700 mt-2">
                                                Your L2 application is pending approval from network validators and full nodes.
                                                API credentials will be generated after approval.
                                            </p>
                                        </div>
                                    )}

                                    {/* API Payload Example - Only for ACTIVE L2 */}
                                    {selectedL2.status === 'ACTIVE' && selectedL2.basic_auth && (
                                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                <h3 className="font-semibold text-blue-800">API Request Example</h3>
                                            </div>

                                            <div className="space-y-4">
                                                {/* Request */}
                                                <div>
                                                    <p className="text-xs text-blue-700 mb-1 font-medium">POST /l2/submit-data (Basic Auth)</p>
                                                    <pre className="p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                                                        {`curl -X POST ${selectedL2.api_endpoint}/submit-data \\
  -H "Content-Type: application/json" \\
  -u "${selectedL2.basic_auth.username}:${selectedL2.basic_auth.api_key}" \\
  -d '{
    "data_type": "SAVE_FILE",
    "payload": {
      "file_url": "https://example.com/document.pdf",
      "file_name": "document.pdf",
      "is_private": true,
      "wallet_address": "0xWALLET_ADDRESS",
      "pin": "123456",
      "metadata": {
        "description": "Sample document",
        "tags": ["important", "2026"]
      }
    }
  }'`}
                                                    </pre>
                                                </div>

                                                {/* Response */}
                                                <div>
                                                    <p className="text-xs text-blue-700 mb-1 font-medium">Response (200 OK)</p>
                                                    <pre className="p-3 bg-gray-800 text-yellow-300 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                                                        {`{
  "trx_id": "dbb8460765696de373538aa2458f949bda8d5209c46161246c69f1ff251df89c",
  "cid": "QmExampleCID1234567890",
  "timestamp": "2026-01-16T12:34:56Z",
  "l2_id": "${selectedL2.l2_id}"
}`}
                                                    </pre>
                                                </div>

                                                {/* Required Fields */}
                                                <div className="p-3 bg-white rounded-lg border border-blue-100">
                                                    <p className="text-xs text-blue-800 font-medium mb-2">Required Fields:</p>
                                                    <ul className="text-xs text-blue-700 space-y-1">
                                                        <li>• <code className="bg-blue-100 px-1 rounded">data_type</code>: SAVE_FILE | GRANT_ACCESS | REVOKE_ACCESS</li>
                                                        <li>• <code className="bg-blue-100 px-1 rounded">payload.file_url</code>: Public URL of the file</li>
                                                        <li>• <code className="bg-blue-100 px-1 rounded">payload.file_name</code>: Original file name</li>
                                                        <li>• <code className="bg-blue-100 px-1 rounded">payload.is_private</code>: true (encrypted) or false (public)</li>
                                                        <li>• <code className="bg-blue-100 px-1 rounded">payload.wallet_address</code>: Owner's wallet address</li>
                                                        <li>• <code className="bg-blue-100 px-1 rounded">payload.pin</code>: 6-digit PIN for authorization</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Transaction Records - Only for ACTIVE L2 */}
                                    {selectedL2.status === 'ACTIVE' && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <FileText className="h-5 w-5 text-gray-600" />
                                                <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                                            </div>

                                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-gray-600 font-medium">TX ID</th>
                                                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Type</th>
                                                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Fee</th>
                                                            <th className="px-4 py-3 text-left text-gray-600 font-medium">Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {mockTransactionRecords.map((tx) => (
                                                            <tr key={tx.tx_id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{tx.tx_id}</td>
                                                                <td className="px-4 py-3">
                                                                    <Badge variant="default" className="text-xs">
                                                                        {tx.type}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-4 py-3 font-medium">{tx.fee} ICL</td>
                                                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(tx.timestamp)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Document Link */}
                                    {selectedL2.document_link && (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-600">Documentation</span>
                                            <a
                                                href={selectedL2.document_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                            >
                                                View Document
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setSelectedL2(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
