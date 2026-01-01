import axios from 'axios';
import type { AxiosError } from 'axios';
import { API_BASE_URL } from './constants';

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
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (data: { full_name: string; email: string; password: string; pin: string }) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
};

// Wallet API
export const walletApi = {
    getWallets: async () => {
        const response = await api.get('/wallets');
        return response.data;
    },
    getWallet: async (walletId: string) => {
        const response = await api.get(`/wallets/${walletId}`);
        return response.data;
    },
    getBalance: async (walletId: string) => {
        const response = await api.get(`/wallets/${walletId}/balance`);
        return response.data;
    },
    createWallet: async (pin: string) => {
        const response = await api.post('/wallets', { pin });
        return response.data;
    },
    transfer: async (data: { from_wallet_id: string; to_wallet_id: string; amount: number; pin: string }) => {
        const response = await api.post('/wallets/transfer', data);
        return response.data;
    },
    mint: async (data: { amount: number; pin: string }) => {
        const response = await api.post('/wallets/mint', data);
        return response.data;
    },
    ownerTransfer: async (data: { to_wallet_id: string; amount: number; pin: string }) => {
        const response = await api.post('/wallets/owner-transfer', data);
        return response.data;
    },
};

// Node API
export const nodeApi = {
    apply: async (data: { node_type: string; stake_wallet_id: string; endpoint_url: string; pin: string }) => {
        const response = await api.post('/nodes/apply', data);
        return response.data;
    },
    getMyApplications: async () => {
        const response = await api.get('/nodes/my-applications');
        return response.data;
    },
    getActiveNodes: async () => {
        const response = await api.get('/nodes/active');
        return response.data;
    },
    getNode: async (nodeId: string) => {
        const response = await api.get(`/nodes/${nodeId}`);
        return response.data;
    },
};

// Governance API
export const governanceApi = {
    getActiveVotes: async () => {
        const response = await api.get('/governance/votes/active');
        return response.data;
    },
    getVote: async (voteId: string) => {
        const response = await api.get(`/governance/votes/${voteId}`);
        return response.data;
    },
    castVote: async (data: { vote_id: string; node_id: string; decision: string; pin: string }) => {
        const response = await api.post('/governance/vote', data);
        return response.data;
    },
    finalizeVote: async (voteId: string) => {
        const response = await api.post(`/governance/votes/${voteId}/finalize`);
        return response.data;
    },
    getPendingNodeApplications: async () => {
        const response = await api.get('/governance/node-applications/pending');
        return response.data;
    },
};

// L2 API
export const l2Api = {
    register: async (data: {
        l2_id: string;
        chaincode_name: string;
        base_fee: number;
        profit_sharing: { developer_share: number; validator_share: number; fullnode_share: number; protocol_share: number };
        pin: string;
    }) => {
        const response = await api.post('/l2/register', data);
        return response.data;
    },
    getMyL2s: async () => {
        const response = await api.get('/l2/my-l2s');
        return response.data;
    },
    getL2: async (l2Id: string) => {
        const response = await api.get(`/l2/${l2Id}`);
        return response.data;
    },
    approve: async (l2Id: string) => {
        const response = await api.post('/l2/approve', { l2_id: l2Id });
        return response.data;
    },
    reject: async (l2Id: string, reason: string) => {
        const response = await api.post('/l2/reject', { l2_id: l2Id, reason });
        return response.data;
    },
};

// User API
export const userApi = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },
};
