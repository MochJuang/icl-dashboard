// User types
export interface User {
    user_id: string;
    email: string;
    full_name: string;
    kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    created_at: string;
}

// Wallet types
export type WalletType = 'REGULAR' | 'NODE' | 'DEVELOPER' | 'OWNER';
export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export interface Wallet {
    wallet_id: string;
    user_id: string;
    wallet_address: string;
    wallet_type: WalletType;
    role: string;
    status: WalletStatus;
    balance: number;
    staked_amount: number;
    created_at: string;
}

// Node types
export type NodeType = 'VALIDATOR' | 'FULL_NODE';
export type NodeStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'EXITED';

export interface Node {
    node_id: string;
    user_id: string;
    node_type: NodeType;
    status: NodeStatus;
    endpoint_url: string;
    stake_amount: number;
    created_at: string;
}

export interface NodeApplication {
    application_id: string;
    user_id: string;
    node_type: NodeType;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    stake_wallet_id: string;
    endpoint_url: string;
    vote_id?: string;
    created_at: string;
}

// Vote types
export type VoteType = 'NODE_JOIN' | 'NODE_EXIT' | 'NODE_SLASH' | 'L2_REGISTER' | 'L2_SUSPEND';
export type VoteStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type VoteDecision = 'APPROVE' | 'REJECT';

export interface Vote {
    vote_id: string;
    vote_type: VoteType;
    status: VoteStatus;
    subject_id: string;
    subject_name?: string;
    proposed_by: string;
    voting_start: string;
    voting_end: string;
    validator_approve: number;
    validator_reject: number;
    fullnode_approve: number;
    fullnode_reject: number;
    total_validators: number;
    total_fullnodes: number;
    my_vote?: VoteDecision;
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
    from_wallet_id?: string;
    to_wallet_id?: string;
    amount: number;
    fee_charged: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    block_number?: number;
    timestamp: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    full_name: string;
    email: string;
    password: string;
    pin: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface TransferRequest {
    from_wallet_id: string;
    to_wallet_id: string;
    amount: number;
    pin: string;
}

export interface MintRequest {
    amount: number;
    pin: string;
}

export interface NodeApplyRequest {
    node_type: NodeType;
    stake_wallet_id: string;
    endpoint_url: string;
    pin: string;
}

export interface CastVoteRequest {
    vote_id: string;
    node_id: string;
    decision: VoteDecision;
    pin: string;
}

export interface L2RegisterRequest {
    l2_id: string;
    chaincode_name: string;
    description?: string;
    base_fee: number;
    profit_sharing: ProfitSharing;
    pin: string;
}
