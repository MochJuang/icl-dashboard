export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const WALLET_TYPE_LABELS: Record<string, string> = {
    REGULAR: 'Regular',
    NODE: 'Node',
    DEVELOPER: 'Developer',
    OWNER: 'Owner',
};

export const NODE_TYPE_LABELS: Record<string, string> = {
    VALIDATOR: 'Validator',
    FULL_NODE: 'Full Node',
};

export const VOTE_TYPE_LABELS: Record<string, string> = {
    NODE_JOIN: 'Node Join',
    NODE_EXIT: 'Node Exit',
    NODE_SLASH: 'Node Slash',
    L2_REGISTER: 'L2 Registration',
    L2_SUSPEND: 'L2 Suspend',
};

export const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-warning-500',
    ACTIVE: 'bg-success-500',
    APPROVED: 'bg-success-500',
    REJECTED: 'bg-danger-500',
    SUSPENDED: 'bg-danger-500',
    EXPIRED: 'bg-gray-500',
};

export const STAKE_REQUIREMENTS = {
    VALIDATOR: 10000,
    FULL_NODE: 3500,
};
