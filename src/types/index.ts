// User types
export interface User {
    user_id: string;
    email: string;
    full_name: string;
    kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    created_at?: string;
}

// Wallet types
export type WalletType = 'REGULAR' | 'NODE_WALLET' | 'DEVELOPER_L2' | 'OWNER';
export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
export type WalletRole = 'USER' | 'VALIDATOR' | 'OWNER' | 'DEVELOPER';

export interface Wallet {
    wallet_id: string;
    wallet_address: string;
    user_id: string;
    type: WalletType;         // API uses 'type' not 'wallet_type'
    wallet_type?: WalletType; // Some responses use wallet_type
    role: WalletRole;
    balance: number;
    locked_balance: number;
    status: WalletStatus;
    is_active: boolean;
    node_id?: string;         // For NODE_WALLET type
    creation_source?: string;
    created_at: string;
    updated_at: string;
}

// Simplified wallet from login/profile response
export interface WalletInfo {
    wallet_id: string;
    wallet_address: string;
    wallet_type: WalletType;
    role: WalletRole;
    balance: number;
    status: WalletStatus;
}

// Node types
export type NodeType = 'VALIDATOR' | 'FULL_NODE';
export type NodeStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED' | 'EXITED';

export interface Node {
    node_id: string;
    node_type: NodeType;
    operator: string;          // User ID of node operator
    status: NodeStatus;
    stake_amount: number;
    node_wallet_id: string;
    voting_power: number;
    joined_at: string;
}

export interface NodeApplication {
    application_id: string;
    user_id: string;
    node_type: NodeType;
    source_wallet_id: string;
    wallet_address: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requested_stake: number;
    endpoint?: string;
    vote_id?: string;
    submitted_at: string;
}

// Vote types
export type VoteType = 'NODE_JOIN' | 'NODE_EXIT' | 'NODE_SLASH' | 'L2_REGISTER' | 'L2_SUSPEND';
export type VoteStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type VoteDecision = 'APPROVE' | 'REJECT' | 'ABSTAIN';

export interface Vote {
    vote_id: string;
    vote_type: VoteType;
    subject_id: string;
    subject_name?: string;
    status: VoteStatus;
    validator_approve: number;
    validator_reject: number;
    fullnode_approve: number;
    fullnode_reject: number;
    total_validators: number;
    total_fullnodes: number;
    voting_end: string;
    created_at: string;
    my_vote?: VoteDecision;
    voted_at?: string;
}

// L2 types
export type L2Status = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface L2 {
    l2_id: string;
    chaincode_name: string;
    owner_user_id: string;
    owner_wallet_id?: string;
    base_fee: number;
    status: L2Status;
    profit_sharing: ProfitSharing;
    created_at: string;
    approved_at?: string;
}

export interface ProfitSharing {
    developer_share: number;
    validator_share: number;
    fullnode_share: number;
    protocol_share: number;
}

// Transaction types
export interface Transaction {
    tx_id: string;
    tx_type: 'TRANSFER' | 'SAVE_FILE' | 'SAVE_DATA' | 'MINT';
    from_wallet?: string;
    from_wallet_address?: string;
    to_wallet?: string;
    to_wallet_address?: string;
    amount: number;
    fee_charged: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    message?: string;
    transferred_at?: string;
    timestamp?: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    full_name: string;
    email: string;
    password: string;
    pin: string;
}

export interface LoginResponseData {
    token: string;
    user_id: string;
    email: string;
    wallets: WalletInfo[];
    roles: string[];
    active_wallet_id: string;
}

export interface RegisterResponseData {
    user_id: string;
    email: string;
    wallet: WalletInfo;
    roles: string[];
    token: string;
}

// Wallet API types
export interface TransferRequest {
    wallet_address: string;
    pin: string;
    transfer: {
        to_wallet_address: string;
        amount: number;
    };
}

export interface TransferResponse {
    tx_id: string;
    from_wallet: string;
    from_wallet_address: string;
    to_wallet: string;
    to_wallet_address: string;
    amount: number;
    fee_charged: number;
    message: string;
    transferred_at: string;
}

export interface MintRequest {
    wallet_address: string;
    pin: string;
    amount: number;
}

export interface MintResponse {
    amount: number;
    wallet_id: string;
    wallet_address: string;
    message: string;
    minted_at: string;
}

export interface OwnerTransferRequest {
    wallet_address: string;
    pin: string;
    transfer: {
        to_wallet_address: string;
        amount: number;
    };
}

export interface WalletBalanceResponse {
    wallet_id: string;
    wallet_address: string;
    balance: number;
    locked_balance: number;
    available_balance: number;
}

// Node API types
export interface NodeApplyRequest {
    wallet_address: string;
    pin: string;
    request: {
        node_type: NodeType;
        stake_amount: number;
        endpoint: string;
    };
}

export interface NodeApplyResponse {
    application_id: string;
    user_id: string;
    node_type: NodeType;
    source_wallet_id: string;
    wallet_address: string;
    status: string;
    message: string;
    submitted_at: string;
    requested_stake: number;
}

// Governance API types
export interface CastVoteRequest {
    wallet_address: string;
    pin: string;
    vote: {
        vote_id: string;
        node_id: string;
        decision: VoteDecision;
    };
}

export interface CastVoteResponse {
    vote_id: string;
    node_id: string;
    decision: VoteDecision;
    message: string;
    voted_at: string;
}

// L2 API types
export interface L2RegisterRequest {
    l2_id: string;
    chaincode_name: string;
    description?: string;
    base_fee: number;
    profit_sharing: ProfitSharing;
    pin: string;
}

// User Profile types
export interface UserProfile {
    user_id: string;
    email: string;
    full_name: string;
    kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    wallets: WalletInfo[];
}

// Constants for stake amounts
export const STAKE_REQUIREMENTS = {
    VALIDATOR: 10000,
    FULL_NODE: 3500,
} as const;

// Wallet type labels
export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
    REGULAR: 'Regular',
    NODE_WALLET: 'Node',
    OWNER: 'Owner',
    DEVELOPER: 'Developer',
};

// Helper to get wallet type from either 'type' or 'wallet_type' field
export function getWalletType(wallet: Wallet | WalletInfo): WalletType {
    return (wallet as Wallet).type || (wallet as WalletInfo).wallet_type || 'REGULAR';
}

// Transfer Record for transaction history
export interface TransferRecord {
    tx_id: string;
    type: string;
    timestamp: string;
    from_wallet_id: string;
    to_wallet_id: string;
    from_user_id?: string;
    to_user_id?: string;
    amount: number;
    description: string;
    from_balance_after?: number;
    to_balance_after?: number;
    vote_id?: string;
    node_id?: string;
    l2_id?: string;
    ref_tx_id?: string;
}

export interface UserProfileResponse {
    user_id: string;
    email: string;
    full_name: string;
    kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    wallets: WalletInfo[];
}

// Transfer History Response
export interface TransferHistoryResponse {
    transfers: TransferRecord[];
    total_count: number;
    wallet_id?: string;
    user_id?: string;
}

// Developer Application
export interface DeveloperApplication {
    application_id: string;
    user_id: string;
    business_plan: string;
    expected_volume: number;
    kyc_documents: string[];
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    notes?: string;
    submitted_at: string;
    reviewed_at?: string;
}

// API Types for Developer
export interface DeveloperApplyRequest {
    business_plan: string;
    expected_volume: number;
    kyc_documents: string[];
}

// Pending Application Response
export interface PendingApplication {
    application_id: string;
    user_id: string;
    application_type: 'NODE' | 'DEVELOPER';
    node_type?: NodeType;
    status: string;
    submitted_at: string;
    vote_id?: string;
}

