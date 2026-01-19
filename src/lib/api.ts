import axios from 'axios';
import type { AxiosError } from 'axios';
import { API_BASE_URL } from './constants';
import type {
    TransferRequest,
    MintRequest,
    OwnerTransferRequest,
    DeveloperApplyRequest,
} from '../types';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Controls whether to use mock data or real API

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('wallets');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// ============================================
// Auth API
// ============================================
export const authApi = {
    /**
     * Login user
     * POST /auth/login
     */
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    /**
     * Register new user
     * POST /auth/register
     */
    register: async (data: { full_name: string; email: string; password: string; pin: string }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
};

// ============================================
// User API
// ============================================
export const userApi = {
    /**
     * Get current user profile
     * GET /users/profile
     */
    getProfile: async () => {
        if (USE_MOCK_DATA) {
            const { mockDeveloperProfile } = await import('./mockData');
            return { data: mockDeveloperProfile };
        }
        const response = await api.get('/users/profile');
        return response.data;
    },

    /**
     * Get current user's wallets
     * GET /users/wallets
     */
    getWallets: async () => {
        if (USE_MOCK_DATA) {
            const { mockWallets } = await import('./mockData');
            return { data: mockWallets };
        }
        const response = await api.get('/users/wallets');
        return response.data;
    },
};

// ============================================
// Wallet API
// ============================================
export const walletApi = {
    /**
     * Get all wallets for current user (detailed)
     * GET /wallets
     */
    getWallets: async () => {
        if (USE_MOCK_DATA) {
            const { mockWallets } = await import('./mockData');
            return { data: mockWallets };
        }
        const response = await api.get('/wallets');
        return response.data;
    },

    /**
     * Create a new wallet
     * POST /wallets
     */
    createWallet: async (pin: string) => {
        const response = await api.post('/wallets', { pin });
        return response.data;
    },

    /**
     * Get wallet by address
     * GET /wallets/address/:address
     */
    getWalletByAddress: async (walletAddress: string) => {
        if (USE_MOCK_DATA) {
            const { mockWallets } = await import('./mockData');
            const wallet = mockWallets.find(w => w.wallet_address === walletAddress);
            return { data: wallet || null };
        }
        const response = await api.get(`/wallets/address/${walletAddress}`);
        return response.data;
    },

    /**
     * Get wallet balance by address
     * GET /wallets/address/:address/balance
     */
    getBalance: async (walletAddress: string) => {
        if (USE_MOCK_DATA) {
            const { mockWallets } = await import('./mockData');
            const wallet = mockWallets.find(w => w.wallet_address === walletAddress);
            if (wallet) {
                return {
                    data: {
                        available_balance: wallet.available_balance,
                        locked_balance: wallet.locked_balance,
                        total_balance: wallet.balance,
                    }
                };
            }
            return { data: null };
        }
        const response = await api.get(`/wallets/address/${walletAddress}/balance`);
        return response.data;
    },

    /**
     * Transfer coins between wallets
     * POST /wallets/transfer
     * 
     * Request format:
     * {
     *   "wallet_address": "0x...",
     *   "pin": "123456",
     *   "transfer": {
     *     "to_wallet_address": "0x...",
     *     "amount": 10
     *   }
     * }
     */
    transfer: async (data: TransferRequest) => {
        if (USE_MOCK_DATA) {
            // Simulate transfer with mock data
            const { mockWallets } = await import('./mockData');
            const sourceWallet = mockWallets.find(w => w.wallet_address === data.wallet_address);

            // Validate PIN (mock PIN is "123456")
            if (data.pin !== "123456") {
                return {
                    success: false,
                    error: "Invalid PIN"
                };
            }

            // Check if source wallet exists and has enough balance
            if (!sourceWallet) {
                return {
                    success: false,
                    error: "Source wallet not found"
                };
            }

            const balance = sourceWallet.available_balance || sourceWallet.balance || 0;
            if (balance < data.transfer.amount) {
                return {
                    success: false,
                    error: `Insufficient balance. Available: ${balance} ICL`
                };
            }

            // Generate mock transaction ID
            const txId = `TX_${Date.now().toString(16).toUpperCase()}`;

            return {
                success: true,
                data: {
                    tx_id: txId,
                    from_wallet: data.wallet_address,
                    to_wallet: data.transfer.to_wallet_address,
                    amount: data.transfer.amount,
                    fee_charged: 0,
                    timestamp: new Date().toISOString(),
                }
            };
        }
        const response = await api.post('/wallets/transfer', data);
        return response.data;
    },

    /**
     * Mint new coins (OWNER only)
     * POST /wallets/mint
     * 
     * Request format:
     * {
     *   "wallet_address": "0x...",
     *   "pin": "123456",
     *   "amount": 10000
     * }
     */
    mint: async (data: MintRequest) => {
        const response = await api.post('/wallets/mint', data);
        return response.data;
    },

    /**
     * Owner transfer (OWNER only, no fee)
     * POST /wallets/owner-transfer
     */
    ownerTransfer: async (data: OwnerTransferRequest) => {
        const response = await api.post('/wallets/owner-transfer', data);
        return response.data;
    },

    /**
     * Get all transfer history for current user
     * GET /wallets/transfers
     */
    getTransferHistory: async () => {
        if (USE_MOCK_DATA) {
            const { mockTransactionHistory } = await import('./mockData');
            // Transform to match TransferRecord type
            const transfers = mockTransactionHistory.map(tx => ({
                tx_id: tx.tx_id,
                type: tx.type,
                from_wallet_id: tx.from_wallet,
                to_wallet_id: tx.to_wallet,
                amount: tx.amount,
                fee: tx.fee,
                status: tx.status,
                description: tx.description,
                timestamp: tx.created_at,
            }));
            return {
                data: {
                    transfers,
                    total_count: transfers.length
                }
            };
        }
        const response = await api.get('/wallets/transfers');
        return response.data;
    },

    /**
     * Get transfer history for a specific wallet
     * GET /wallets/:wallet_id/history
     */
    getWalletHistory: async (walletId: string) => {
        if (USE_MOCK_DATA) {
            const { mockTransactionHistory, mockWallets } = await import('./mockData');
            // Find wallet address from wallet_id
            const wallet = mockWallets.find(w => w.wallet_id === walletId);
            const walletAddress = wallet?.wallet_address || walletId;

            // Filter transactions for this wallet
            const transfers = mockTransactionHistory
                .filter(tx => tx.from_wallet === walletAddress || tx.to_wallet === walletAddress)
                .map(tx => ({
                    tx_id: tx.tx_id,
                    type: tx.type,
                    from_wallet_id: tx.from_wallet,
                    to_wallet_id: tx.to_wallet,
                    amount: tx.amount,
                    fee: tx.fee,
                    status: tx.status,
                    description: tx.description,
                    timestamp: tx.created_at,
                }));
            return {
                data: {
                    transfers,
                    total_count: transfers.length
                }
            };
        }
        const response = await api.get(`/wallets/${walletId}/history`);
        return response.data;
    },
};

// ============================================
// Node API
// ============================================
export const nodeApi = {
    /**
     * Apply to become a node
     * POST /nodes/apply
     * 
     * Request format (per Postman):
     * {
     *   "wallet_id": "xxx",
     *   "pin": "123456",
     *   "request": {
     *     "node_type": "VALIDATOR" | "FULL_NODE",
     *     "stake_amount": 10000,
     *     "endpoint": "peer0.myorg.example.com:7051"
     *   }
     * }
     */
    apply: async (data: { wallet_address: string; pin: string; request: { node_type: string; stake_amount: number; endpoint: string } }) => {
        const response = await api.post('/nodes/apply', data);
        return response.data;
    },

    /**
     * Get current user's node applications
     * GET /nodes/my-applications
     */
    getMyApplications: async () => {
        if (USE_MOCK_DATA) {
            const { mockNodeApplications } = await import('./mockData');
            return { data: mockNodeApplications };
        }
        const response = await api.get('/nodes/my-applications');
        return response.data;
    },

    /**
     * Get current user's active nodes
     * GET /nodes/my-nodes
     */
    getMyNodes: async () => {
        if (USE_MOCK_DATA) {
            const { mockMyNodes } = await import('./mockData');
            return { data: mockMyNodes };
        }
        const response = await api.get('/nodes/my-nodes');
        return response.data;
    },

    /**
     * Get all active nodes in network
     * GET /nodes/active
     */
    getActiveNodes: async () => {
        if (USE_MOCK_DATA) {
            const { mockActiveNodes } = await import('./mockData');
            return { data: mockActiveNodes };
        }
        const response = await api.get('/nodes/active');
        return response.data;
    },

    /**
     * Get node by ID
     * GET /nodes/:nodeId
     */
    getNode: async (nodeId: string) => {
        const response = await api.get(`/nodes/${nodeId}`);
        return response.data;
    },

    /**
     * Activate a node
     * POST /nodes/:nodeId/activate
     */
    activateNode: async (nodeId: string) => {
        const response = await api.post(`/nodes/${nodeId}/activate`);
        return response.data;
    },

    /**
     * Deactivate a node
     * POST /nodes/:nodeId/deactivate
     */
    deactivateNode: async (nodeId: string) => {
        const response = await api.post(`/nodes/${nodeId}/deactivate`);
        return response.data;
    },

    /**
     * Get node application by ID
     * GET /nodes/applications/:applicationId
     */
    getApplication: async (applicationId: string) => {
        const response = await api.get(`/nodes/applications/${applicationId}`);
        return response.data;
    },

    /**
     * Create node identity (enroll with ca-user and ca-node)
     * POST /nodes/create-identity
     *
     * This should be called after node application is approved
     * and NODE wallet is created
     */
    createNodeIdentity: async (data: { node_wallet_address: string; pin: string }) => {
        const response = await api.post('/nodes/create-identity', data);
        return response.data;
    },
};

// ============================================
// Governance API
// ============================================
import { USE_MOCK_DATA, mockPendingVotes } from './mockData';

export const governanceApi = {
    /**
     * Get all active votes
     * GET /governance/votes/active
     */
    getActiveVotes: async () => {
        if (USE_MOCK_DATA) {
            return { data: mockPendingVotes };
        }
        const response = await api.get('/governance/votes/active');
        return response.data;
    },

    /**
     * Get vote by ID
     * GET /governance/votes/:voteId
     */
    getVote: async (voteId: string) => {
        if (USE_MOCK_DATA) {
            const vote = mockPendingVotes.find(v => v.vote_id === voteId);
            if (vote) {
                return { data: vote };
            }
        }
        const response = await api.get(`/governance/votes/${voteId}`);
        return response.data;
    },

    /**
     * Cast a vote (NODE_WALLET only)
     * POST /governance/vote
     * 
     * Request format (per API spec):
     * {
     *   "wallet_address": "0x...",
     *   "pin": "123456",
     *   "vote": {
     *     "vote_id": "vote_xxx",
     *     "node_id": "VAL_xxx",
     *     "decision": "APPROVE" | "REJECT" | "ABSTAIN"
     *   }
     * }
     */
    castVote: async (data: { wallet_address: string; pin: string; vote: { vote_id: string; node_id: string; decision: string } }) => {
        const response = await api.post('/governance/vote', data);
        return response.data;
    },

    /**
     * Get pending node applications
     * GET /governance/node-applications/pending
     */
    getPendingNodeApplications: async () => {
        if (USE_MOCK_DATA) {
            return { data: [] }; // No pending node applications for now
        }
        const response = await api.get('/governance/node-applications/pending');
        return response.data;
    },

    /**
     * Get pending developer applications
     * GET /governance/developer-applications/pending
     */
    getPendingDeveloperApplications: async () => {
        if (USE_MOCK_DATA) {
            return { data: [] }; // No pending developer applications for now
        }
        const response = await api.get('/governance/developer-applications/pending');
        return response.data;
    },

    /**
     * Finalize a vote (when voting period ends)
     * POST /governance/votes/:voteId/finalize
     */
    finalizeVote: async (voteId: string) => {
        const response = await api.post(`/governance/votes/${voteId}/finalize`);
        return response.data;
    },
};

// ============================================
// L2 API
// ============================================
import { mockL2Applications } from './mockData';

export const l2Api = {
    /**
     * Register a new L2 application
     * POST /l2/register
     */
    register: async (data: { pin: string; name: string; description: string; document_link?: string; fee: number }) => {
        const response = await api.post('/l2/register', data);
        return response.data;
    },

    /**
     * Get current user's L2 applications
     * GET /l2/my-l2s
     */
    getMyL2s: async () => {
        if (USE_MOCK_DATA) {
            // Return all L2 apps (PENDING and ACTIVE)
            return { data: mockL2Applications };
        }
        const response = await api.get('/l2/my-l2s');
        return response.data;
    },

    /**
     * Get L2 by ID
     * GET /l2/:l2Id
     */
    getL2: async (l2Id: string) => {
        if (USE_MOCK_DATA) {
            const l2 = mockL2Applications.find(l => l.l2_id === l2Id);
            if (l2) {
                return { data: l2 };
            }
        }
        const response = await api.get(`/l2/${l2Id}`);
        return response.data;
    },

    /**
     * Approve L2 (OWNER only)
     * POST /l2/approve
     */
    approve: async (l2Id: string) => {
        const response = await api.post('/l2/approve', { l2_id: l2Id });
        return response.data;
    },

    /**
     * Reject L2 (OWNER only)
     * POST /l2/reject
     */
    reject: async (l2Id: string, reason: string) => {
        const response = await api.post('/l2/reject', { l2_id: l2Id, reason });
        return response.data;
    },

    /**
     * Get L2 transactions
     * GET /l2/:l2Id/transactions
     */
    getTransactions: async (l2Id: string, page: number = 1, limit: number = 10) => {
        if (USE_MOCK_DATA) {
            // Return empty transactions for mock
            return {
                data: {
                    transactions: [],
                    total_count: 0,
                    page,
                    limit
                }
            };
        }
        const response = await api.get(`/l2/${l2Id}/transactions`, {
            params: { page, limit }
        });
        return response.data;
    },

    /**
     * Get L2 statistics
     * GET /l2/:l2Id/stats
     */
    getStats: async (l2Id: string) => {
        if (USE_MOCK_DATA) {
            // Return mock stats
            return {
                data: {
                    total_transactions: 0,
                    total_fees_collected: 0,
                    total_files: 0,
                    total_data_records: 0,
                    developer_earnings: 0
                }
            };
        }
        const response = await api.get(`/l2/${l2Id}/stats`);
        return response.data;
    },
};

// ============================================
// Developer API
// ============================================
export const developerApi = {
    /**
     * Apply for L2 developer status
     * POST /developer/apply
     */
    apply: async (data: DeveloperApplyRequest) => {
        const response = await api.post('/developer/apply', data);
        return response.data;
    },

    /**
     * Get current user's developer application
     * GET /developer/my-application
     */
    getMyApplication: async () => {
        const response = await api.get('/developer/my-application');
        return response.data;
    },

    /**
     * Approve developer application (OWNER only)
     * POST /l2/developer/approve
     */
    approve: async (applicationId: string, notes?: string) => {
        const response = await api.post('/l2/developer/approve', {
            application_id: applicationId,
            notes
        });
        return response.data;
    },

    /**
     * Reject developer application (OWNER only)
     * POST /l2/developer/reject
     */
    reject: async (applicationId: string, reason: string) => {
        const response = await api.post('/l2/developer/reject', {
            application_id: applicationId,
            reason
        });
        return response.data;
    },
};

// ============================================
// Health API
// ============================================
export const healthApi = {
    /**
     * Check service health
     * GET /health
     */
    check: async () => {
        const response = await api.get('/health');
        return response.data;
    },
};

// ============================================
// File API
// ============================================
export interface SaveFileRequest {
    file_url: string;
    file_name: string;
    is_private: boolean;
    wallet_address: string;
    pin: string;
    metadata?: Record<string, unknown>;
    l2_id?: string;
}

export interface ShareFileAccessRequest {
    tx_id: string;
    owner_wallet_address: string;
    recipient_email: string;
    permission: 'read' | 'write' | 'read-write';
    pin: string;
}

export interface DownloadPrivateFileRequest {
    tx_id: string;
    wallet_address: string;
    pin: string;
}

export interface FileInfo {
    tx_id: string;
    l2_id?: string;
    ipfs_cid: string;
    file_name: string;
    file_size?: number;
    is_private: boolean;
    encrypted_key?: string;
    owner_wallet: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    shared_with?: Array<{
        wallet_address: string;
        permission: string;
        granted_at: string;
        encrypted_key: string;
    }>;
    has_access: boolean;
    access_type?: 'owner' | 'shared';
}

export interface SaveFileResponse {
    success: boolean;
    message: string;
    tx_id: string;
    fee_charged: number;
    system_gas_fee: number;
    owner_fee: number;
    l2_base_fee: number;
    timestamp: string;
    ipfs_cid: string;
    encrypted_key?: string;
    is_private: boolean;
    file_name: string;
}

export const fileApi = {
    /**
     * Save file (upload to IPFS and record on blockchain)
     * POST /transactions/save-file
     *
     * For private files:
     * - File is encrypted with AES-256-GCM
     * - AES key is encrypted with wallet's public key
     * - Returns encrypted_key for future access
     */
    saveFile: async (data: SaveFileRequest): Promise<{ success: boolean; data?: SaveFileResponse; error?: string }> => {
        const response = await api.post('/transactions/save-file', data);
        return response.data;
    },

    /**
     * Get file info from ledger
     * GET /files/:tx_id
     */
    getFileInfo: async (txId: string): Promise<{ success: boolean; data?: FileInfo; error?: string }> => {
        const response = await api.get(`/files/${txId}`);
        return response.data;
    },

    /**
     * Download private file (decrypt and return)
     * POST /files/download
     *
     * Returns the decrypted file as blob
     */
    downloadPrivateFile: async (data: DownloadPrivateFileRequest): Promise<Blob> => {
        const response = await api.post('/files/download', data, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Share file access with another user by email
     * POST /files/share
     *
     * Flow:
     * 1. Decrypt AES key with owner's private key
     * 2. Get recipient's regular wallet by email
     * 3. Re-encrypt AES key with recipient's public key
     * 4. Store new encrypted key on ledger
     */
    shareFileAccess: async (data: ShareFileAccessRequest): Promise<{ success: boolean; message?: string; error?: string }> => {
        const response = await api.post('/files/share', data);
        return response.data;
    },

    /**
     * Get list of files owned by user
     * GET /files/my-files
     */
    getMyFiles: async (): Promise<{ success: boolean; data?: FileInfo[]; error?: string }> => {
        const response = await api.get('/files/my-files');
        return response.data;
    },

    /**
     * Get list of files shared with user
     * GET /files/shared-with-me
     */
    getSharedWithMe: async (): Promise<{ success: boolean; data?: FileInfo[]; error?: string }> => {
        const response = await api.get('/files/shared-with-me');
        return response.data;
    },
};

