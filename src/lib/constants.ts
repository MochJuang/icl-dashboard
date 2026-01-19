export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://3eb1b21c59df.ngrok-free.app/api/v1';

export const WALLET_TYPE_LABELS: Record<string, string> = {
    REGULAR: 'Regular',
    NODE_WALLET: 'Node',
    NODE: 'Node', // Backward compatibility
    DEVELOPER_L2: 'Developer',
    OWNER: 'Owner',
};

export const WALLET_TYPE_COLORS: Record<string, string> = {
    REGULAR: 'bg-blue-100 text-blue-700',
    NODE_WALLET: 'bg-purple-100 text-purple-700',
    NODE: 'bg-purple-100 text-purple-700',
    DEVELOPER: 'bg-green-100 text-green-700',
    OWNER: 'bg-amber-100 text-amber-700',
};

export const NODE_TYPE_LABELS: Record<string, string> = {
    VALIDATOR: 'Validator',
    FULL_NODE: 'Full Node',
};

export const VOTE_TYPE_LABELS: Record<string, string> = {
    NODE_JOIN: 'Node Join Request',
    NODE_EXIT: 'Node Exit Request',
    NODE_SLASH: 'Node Slash Proposal',
    L2_REGISTER: 'L2 Registration',
    L2_SUSPEND: 'L2 Suspension',
};

export const VOTE_DECISION_LABELS: Record<string, string> = {
    APPROVE: 'Approve',
    REJECT: 'Reject',
    ABSTAIN: 'Abstain',
};

export const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    ACTIVE: 'bg-green-100 text-green-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    INACTIVE: 'bg-gray-100 text-gray-700',
    EXPIRED: 'bg-gray-100 text-gray-700',
    EXITED: 'bg-gray-100 text-gray-700',
};

export const STAKE_REQUIREMENTS = {
    VALIDATOR: 10000,
    FULL_NODE: 3500,
} as const;

// Role-based access constants
export const ROLE_ACCESS = {
    // Roles that can vote
    VOTING_ROLES: ['VALIDATOR', 'FULL_NODE'],
    // Wallet types that can vote
    VOTING_WALLET_TYPES: ['NODE_WALLET'],
    // Wallet types that can transfer
    TRANSFER_WALLET_TYPES: ['REGULAR', 'OWNER', 'DEVELOPER'],
    // Wallet types that can apply for node
    NODE_APPLY_WALLET_TYPES: ['REGULAR'],
} as const;

// Feature flags based on wallet type
export function canTransfer(walletType: string): boolean {
    return ROLE_ACCESS.TRANSFER_WALLET_TYPES.includes(walletType as 'REGULAR' | 'OWNER' | 'DEVELOPER');
}

export function canVote(walletType: string): boolean {
    return ROLE_ACCESS.VOTING_WALLET_TYPES.includes(walletType as 'NODE_WALLET');
}

export function canApplyForNode(walletType: string): boolean {
    return ROLE_ACCESS.NODE_APPLY_WALLET_TYPES.includes(walletType as 'REGULAR');
}

export function canMint(walletType: string): boolean {
    return walletType === 'OWNER';
}
