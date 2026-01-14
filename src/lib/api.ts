import axios from 'axios';
import type { AxiosError } from 'axios';
import { API_BASE_URL } from './constants';
import type {
    TransferRequest,
    MintRequest,
    OwnerTransferRequest,
    L2RegisterRequest,
    DeveloperApplyRequest,
} from '../types';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
        const response = await api.get('/users/profile');
        return response.data;
    },

    /**
     * Get current user's wallets
     * GET /users/wallets
     */
    getWallets: async () => {
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
        const response = await api.get(`/wallets/address/${walletAddress}`);
        return response.data;
    },

    /**
     * Get wallet balance by address
     * GET /wallets/address/:address/balance
     */
    getBalance: async (walletAddress: string) => {
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
        const response = await api.get('/wallets/transfers');
        return response.data;
    },

    /**
     * Get transfer history for a specific wallet
     * GET /wallets/:wallet_id/history
     */
    getWalletHistory: async (walletId: string) => {
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
        const response = await api.get('/nodes/my-applications');
        return response.data;
    },

    /**
     * Get current user's active nodes
     * GET /nodes/my-nodes
     */
    getMyNodes: async () => {
        const response = await api.get('/nodes/my-nodes');
        return response.data;
    },

    /**
     * Get all active nodes in network
     * GET /nodes/active
     */
    getActiveNodes: async () => {
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
};

// ============================================
// Governance API
// ============================================
export const governanceApi = {
    /**
     * Get all active votes
     * GET /governance/votes/active
     */
    getActiveVotes: async () => {
        const response = await api.get('/governance/votes/active');
        return response.data;
    },

    /**
     * Get vote by ID
     * GET /governance/votes/:voteId
     */
    getVote: async (voteId: string) => {
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
        const response = await api.get('/governance/node-applications/pending');
        return response.data;
    },

    /**
     * Get pending developer applications
     * GET /governance/developer-applications/pending
     */
    getPendingDeveloperApplications: async () => {
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
export const l2Api = {
    /**
     * Register a new L2 application
     * POST /l2/register
     */
    register: async (data: L2RegisterRequest) => {
        const response = await api.post('/l2/register', data);
        return response.data;
    },

    /**
     * Get current user's L2 applications
     * GET /l2/my-l2s
     */
    getMyL2s: async () => {
        const response = await api.get('/l2/my-l2s');
        return response.data;
    },

    /**
     * Get L2 by ID
     * GET /l2/:l2Id
     */
    getL2: async (l2Id: string) => {
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
