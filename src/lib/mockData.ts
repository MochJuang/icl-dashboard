/**
 * Mock Data for Frontend Demo/Screenshots
 * Set USE_MOCK_DATA = true to use hardcoded dummy data
 */

export const USE_MOCK_DATA = false;

// ============================================
// Mock L2 Applications (for L2 Register page)
// ============================================
export const mockL2Applications = [
    // L2 Application yang sudah APPROVED (untuk Test Case 6)
    {
        l2_id: "L2_trash_mgmt_001",
        name: "Trash Management App",
        description: "Aplikasi pengelolaan sampah berbasis blockchain untuk tracking pengumpulan, pemilahan, dan daur ulang sampah di tingkat kota. Terintegrasi dengan IoT sensor pada tempat sampah pintar untuk monitoring real-time kapasitas dan jadwal pengambilan.",
        developer_id: "DEV_001",
        developer_name: "PT Lingkungan Bersih Indonesia",
        gas_fee: 2.0,
        status: "ACTIVE", // APPROVED via governance voting!
        document_link: "https://docs.google.com/document/d/trash-management-whitepaper",
        created_at: "2026-01-15T08:30:00Z",
        updated_at: "2026-01-15T14:30:00Z",
        approved_at: "2026-01-15T14:30:00Z",
        // Fee distribution
        fee_distribution: {
            min_fee: 1.0,
            validator_share: 0.5,  // 50% of min_fee
            fullnode_share: 0.3,   // 30% of min_fee
            protocol_share: 0.2,   // 20% of min_fee
            developer_margin: 1.0, // gas_fee - min_fee
        },
        // Basic Auth credentials - generated after approval!
        basic_auth: {
            username: "trash_mgmt_l2",
            api_key: "tm_api_a1b2c3d4e5f6g7h8",
            generated_at: "2026-01-15T14:30:00Z",
        },
        // API endpoint
        api_endpoint: "https://api.icl.network/v1/l2/L2_trash_mgmt_001",
    },
    // // L2 Application ACTIVE lainnya (contoh)
    // {
    //     l2_id: "L2_health_record_002",
    //     name: "Health Record Chain",
    //     description: "Sistem rekam medis terdesentralisasi untuk rumah sakit dan klinik.",
    //     developer_id: "DEV_002",
    //     developer_name: "PT Sehat Digital",
    //     gas_fee: 3.5,
    //     status: "ACTIVE",
    //     document_link: "https://docs.google.com/document/d/health-record-whitepaper",
    //     created_at: "2026-01-10T10:00:00Z",
    //     updated_at: "2026-01-12T14:30:00Z",
    //     approved_at: "2026-01-12T14:30:00Z",
    //     fee_distribution: {
    //         min_fee: 1.0,
    //         validator_share: 0.5,
    //         fullnode_share: 0.3,
    //         protocol_share: 0.2,
    //         developer_margin: 2.5,
    //     },
    //     basic_auth: {
    //         username: "health_record_l2",
    //         api_key: "hrc_api_xxxx1234",
    //         generated_at: "2026-01-12T14:30:00Z",
    //     },
    //     api_endpoint: "https://api.icl.network/v1/l2/L2_health_record_002",
    // },
];

// ============================================
// Mock Votes (for Governance/Voting page)
// ============================================

// Vote yang masih PENDING (untuk Test Case 5)
export const mockPendingVotes = [
    {
        vote_id: "VOTE_NODE_fn_001",
        vote_type: "NODE_APPLICATION",
        subject_id: "APP_node_fn_001",
        subject_name: "Full Node Application",
        description: "Voting untuk node application: Full Node dengan stake 3,500 ICL. Endpoint: fullnode.example.com:7051",
        status: "APPROVED", // Auto-executed!
        // Vote counts - threshold tercapai
        approve_count: 5,
        reject_count: 0,
        abstain_count: 0,
        // Validator votes: 67% tercapai (2/3 = 67%)
        validator_approve: 2,
        validator_reject: 0,
        validator_total: 3,
        // Full Node votes: 55% tercapai (3/5 = 60%)
        fullnode_approve: 3,
        fullnode_reject: 0,
        fullnode_total: 5,
        // Thresholds
        threshold_validator: 67,
        threshold_fullnode: 55,
        // Timestamps
        created_at: "2026-01-15T09:00:00Z",
        executed_at: "2026-01-15T16:00:00Z",
        expires_at: "2026-01-18T09:00:00Z",
        // Metadata
        metadata: {
            node_type: "FULL_NODE",
            stake_amount: 3500,
            endpoint: "fullnode.example.com:7051",
            applicant_wallet: "WALLET_applicant_001",
        },
        // All voters
        voters: [
            { node_id: "VAL_001", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T10:00:00Z" },
            { node_id: "VAL_002", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T11:30:00Z" },
            { node_id: "FN_001", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T12:00:00Z" },
            { node_id: "FN_002", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T14:00:00Z" },
            { node_id: "FN_003", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T16:00:00Z" },
        ],
        // Result of auto-execute
        execution_result: {
            success: true,
            action: "NODE_ACTIVATED",
            message: "Node Application approved. Node is now active and stake has been locked.",
        },
    },
    {

        vote_id: "VOTE_L2_trash_001",
        vote_type: "L2_REGISTRATION",
        subject_id: "L2_trash_mgmt_001",
        subject_name: "Trash Management App",
        description: "Voting untuk registrasi L2 Application: Trash Management App dengan gas fee 2.0 ICL. Developer: PT Lingkungan Bersih Indonesia.",
        status: "APPROVED",
        // Vote counts - belum mencapai threshold
        approve_count: 2,
        reject_count: 0,
        abstain_count: 0,
        // Validator votes (threshold: 67% = 2/3)
        validator_approve: 2,
        validator_reject: 0,
        validator_total: 3,
        // Full Node votes (threshold: 55% = 3/5)
        fullnode_approve: 4,
        fullnode_reject: 0,
        fullnode_total: 5,
        // Thresholds
        threshold_validator: 67,
        threshold_fullnode: 55,
        // Timestamps
        created_at: "2026-01-15T09:00:00Z",
        expires_at: "2026-01-18T09:00:00Z",
        // Additional metadata for display
        metadata: {
            l2_name: "Trash Management App",
            gas_fee: 2.0,
            developer: "PT Lingkungan Bersih Indonesia",
            document_link: "https://docs.google.com/document/d/trash-management-whitepaper",
        },
        // Voters (who already voted)
        voters: [
            { node_id: "VAL_001", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T10:00:00Z" },
            { node_id: "VAL_002", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T11:30:00Z" },
            { node_id: "FN_001", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T12:00:00Z" },
            { node_id: "FN_002", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T14:00:00Z" },
            { node_id: "FN_003", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T16:00:00Z" },
        ],
    },
];

// Vote yang sudah APPROVED - untuk Test Case 6 (threshold terpenuhi, auto-execute)
export const mockApprovedVotes = [
    // L2 Registration Vote - APPROVED (Test Case 6)
    {
        vote_id: "VOTE_L2_trash_001",
        vote_type: "L2_REGISTRATION",
        subject_id: "L2_trash_mgmt_001",
        subject_name: "Trash Management App",
        description: "Voting untuk registrasi L2 Application: Trash Management App dengan gas fee 2.0 ICL. Developer: PT Lingkungan Bersih Indonesia.",
        status: "APPROVED", // Auto-executed!
        // Vote counts - threshold tercapai
        approve_count: 5,
        reject_count: 0,
        abstain_count: 0,
        // Validator votes: 67% tercapai (2/3 = 67%)
        validator_approve: 2,
        validator_reject: 0,
        validator_total: 3,
        // Full Node votes: 55% tercapai (3/5 = 60%)
        fullnode_approve: 3,
        fullnode_reject: 0,
        fullnode_total: 5,
        // Thresholds
        threshold_validator: 67,
        threshold_fullnode: 55,
        // Timestamps
        created_at: "2026-01-15T09:00:00Z",
        executed_at: "2026-01-15T14:30:00Z", // Auto-execute timestamp
        // Metadata
        metadata: {
            l2_name: "Trash Management App",
            gas_fee: 2.0,
            developer: "PT Lingkungan Bersih Indonesia",
            document_link: "https://docs.google.com/document/d/trash-management-whitepaper",
        },
        // All voters
        voters: [
            { node_id: "VAL_001", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T10:00:00Z" },
            { node_id: "VAL_002", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T11:30:00Z" },
            { node_id: "FN_001", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T12:00:00Z" },
            { node_id: "FN_002", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T13:00:00Z" },
            { node_id: "FN_003", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T14:30:00Z" },
        ],
        // Result of auto-execute
        execution_result: {
            success: true,
            action: "L2_ACTIVATED",
            message: "L2 Application 'Trash Management App' has been activated with Basic Auth credentials generated.",
        },
    },
    // Node Application Vote - APPROVED (Test Case 8)
    {
        vote_id: "VOTE_NODE_fn_001",
        vote_type: "NODE_APPLICATION",
        subject_id: "APP_node_fn_001",
        subject_name: "Full Node Application",
        description: "Voting untuk node application: Full Node dengan stake 3,500 ICL. Endpoint: fullnode.example.com:7051",
        status: "APPROVED", // Auto-executed!
        // Vote counts - threshold tercapai
        approve_count: 5,
        reject_count: 0,
        abstain_count: 0,
        // Validator votes: 67% tercapai (2/3 = 67%)
        validator_approve: 2,
        validator_reject: 0,
        validator_total: 3,
        // Full Node votes: 55% tercapai (3/5 = 60%)
        fullnode_approve: 3,
        fullnode_reject: 0,
        fullnode_total: 5,
        // Thresholds
        threshold_validator: 67,
        threshold_fullnode: 55,
        // Timestamps
        created_at: "2026-01-15T09:00:00Z",
        executed_at: "2026-01-15T16:00:00Z",
        expires_at: "2026-01-18T09:00:00Z",
        // Metadata
        metadata: {
            node_type: "FULL_NODE",
            stake_amount: 3500,
            endpoint: "fullnode.example.com:7051",
            applicant_wallet: "WALLET_applicant_001",
        },
        // All voters
        voters: [
            { node_id: "VAL_001", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T10:00:00Z" },
            { node_id: "VAL_002", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T11:30:00Z" },
            { node_id: "FN_001", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T12:00:00Z" },
            { node_id: "FN_002", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T14:00:00Z" },
            { node_id: "FN_003", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T16:00:00Z" },
        ],
        // Result of auto-execute
        execution_result: {
            success: true,
            action: "NODE_ACTIVATED",
            message: "Node Application approved. Node is now active and stake has been locked.",
        },
    },
];

// Vote PENDING untuk Node Application (Test Case 7: Status PENDING)
export const mockPendingNodeVotes = [
    // {
    //     vote_id: "VOTE_NODE_fn_002",
    //     vote_type: "NODE_APPLICATION",
    //     subject_id: "APP_node_fn_001",
    //     subject_name: "Full Node Application - Pending",
    //     description: "Voting untuk node application: Full Node dengan stake 3,500 ICL. Endpoint: fullnode.example.com:7051",
    //     status: "PENDING",
    //     // Vote counts - belum mencapai threshold
    //     approve_count: 3,
    //     reject_count: 0,
    //     abstain_count: 0,
    //     // Validator votes (threshold: 67% = 2/3)
    //     validator_approve: 1,
    //     validator_reject: 0,
    //     validator_total: 3,
    //     // Full Node votes (threshold: 55% = 3/5)
    //     fullnode_approve: 2,
    //     fullnode_reject: 0,
    //     fullnode_total: 5,
    //     // Thresholds
    //     threshold_validator: 67,
    //     threshold_fullnode: 55,
    //     // Timestamps
    //     created_at: "2026-01-15T09:00:00Z",
    //     expires_at: "2026-01-18T09:00:00Z",
    //     // Metadata
    //     metadata: {
    //         node_type: "FULL_NODE",
    //         stake_amount: 3500,
    //         endpoint: "fullnode.example.com:7051",
    //         applicant_wallet: "WALLET_applicant_001",
    //     },
    //     // Voters so far
    //     voters: [
    //         { node_id: "VAL_001", node_type: "VALIDATOR", decision: "APPROVE", voted_at: "2026-01-15T10:00:00Z" },
    //         { node_id: "FN_001", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T12:00:00Z" },
    //         { node_id: "FN_002", node_type: "FULL_NODE", decision: "APPROVE", voted_at: "2026-01-15T14:00:00Z" },
    //     ],
    // },
];

// L2 Application yang sudah ACTIVE dengan Basic Auth (hasil dari Test Case 6)
export const mockApprovedL2 = {
    l2_id: "L2_trash_mgmt_001",
    name: "Trash Management App",
    description: "Aplikasi pengelolaan sampah berbasis blockchain untuk tracking pengumpulan, pemilahan, dan daur ulang sampah di tingkat kota.",
    developer_id: "DEV_001",
    developer_name: "PT Lingkungan Bersih Indonesia",
    gas_fee: 2.0,
    status: "ACTIVE", // Approved and activated!
    document_link: "https://docs.google.com/document/d/trash-management-whitepaper",
    created_at: "2024-01-15T08:30:00Z",
    approved_at: "2024-01-15T14:30:00Z",
    fee_distribution: {
        min_fee: 1.0,
        validator_share: 0.5,
        fullnode_share: 0.3,
        protocol_share: 0.2,
        developer_margin: 1.0,
    },
    // Basic Auth credentials - generated after approval!
    basic_auth: {
        username: "trash_mgmt_l2",
        api_key: "tm_api_a1b2c3d4e5f6",
        generated_at: "2024-01-15T14:30:00Z",
    },
    // API endpoint for L2 to use
    api_endpoint: "https://api.icl.network/v1/l2/L2_trash_mgmt_001",
};

// ============================================
// Mock Active Nodes (for voting context)
// ============================================
export const mockActiveNodes = [
    {
        node_id: "VAL_001",
        node_type: "VALIDATOR",
        status: "ACTIVE",
        endpoint: "validator1.icl.network:7051",
        stake_amount: 10000,
        owner_wallet: "WALLET_val_001",
        owner_name: "Node Operator 1",
    },
    {
        node_id: "VAL_002",
        node_type: "VALIDATOR",
        status: "ACTIVE",
        endpoint: "validator2.icl.network:7051",
        stake_amount: 10000,
        owner_wallet: "WALLET_val_002",
        owner_name: "Node Operator 2",
    },
    {
        node_id: "VAL_003",
        node_type: "VALIDATOR",
        status: "ACTIVE",
        endpoint: "validator3.icl.network:7051",
        stake_amount: 10000,
        owner_wallet: "WALLET_val_003",
        owner_name: "Node Operator 3",
    },
    {
        node_id: "FN_001",
        node_type: "FULL_NODE",
        status: "ACTIVE",
        endpoint: "fullnode1.icl.network:7051",
        stake_amount: 3500,
        owner_wallet: "WALLET_fn_001",
        owner_name: "Full Node Operator 1",
    },
    {
        node_id: "FN_002",
        node_type: "FULL_NODE",
        status: "ACTIVE",
        endpoint: "fullnode2.icl.network:7051",
        stake_amount: 3500,
        owner_wallet: "WALLET_fn_002",
        owner_name: "Full Node Operator 2",
    },
    {
        node_id: "FN_003",
        node_type: "FULL_NODE",
        status: "ACTIVE",
        endpoint: "fullnode3.icl.network:7051",
        stake_amount: 3500,
        owner_wallet: "WALLET_fn_003",
        owner_name: "Full Node Operator 3",
    },
    {
        node_id: "FN_004",
        node_type: "FULL_NODE",
        status: "ACTIVE",
        endpoint: "fullnode4.icl.network:7051",
        stake_amount: 3500,
        owner_wallet: "WALLET_fn_004",
        owner_name: "Full Node Operator 4",
    },
    {
        node_id: "FN_005",
        node_type: "FULL_NODE",
        status: "ACTIVE",
        endpoint: "fullnode5.icl.network:7051",
        stake_amount: 3500,
        owner_wallet: "WALLET_fn_005",
        owner_name: "Full Node Operator 5",
    },
];

// ============================================
// Mock Developer Profile
// ============================================
export const mockDeveloperProfile = {
    user_id: "USER_dev_001",
    email: "developer@lingkunganbersih.co.id",
    full_name: "Budi Santoso",
    role: "DEVELOPER",
    is_developer: true,
    developer_status: "APPROVED",
    created_at: "2026-01-10T10:00:00Z",
};

// ============================================
// Mock Wallets (for current user)
// ============================================
export const mockWallets = [
    {
        wallet_id: "0x8aef37c4",
        wallet_address: "0x305ba565",
        wallet_type: "REGULAR",
        type: "REGULAR",
        status: "ACTIVE",
        balance: 3500,
        available_balance: 3500,
        locked_balance: 0,
        created_at: "2026-01-10T10:00:00Z",
        // Transaction history summary
        total_received: 15000.00,
        total_sent: 11500.00,
        last_transaction_at: "2026-01-16T14:30:00Z",
    },
];

// ============================================
// Mock My Nodes (nodes owned by current user)
// ============================================
export const mockMyNodes = [
    // {
    //     node_id: "VAL_001",
    //     node_type: "VALIDATOR",
    //     status: "ACTIVE",
    //     endpoint: "validator1.icl.network:7051",
    //     stake_amount: 10000,
    //     owner_wallet: "WALLET_node_001",
    //     owner_name: "Budi Santoso",
    //     created_at: "2026-01-08T09:00:00Z",
    //     activated_at: "2026-01-08T10:00:00Z",
    //     // Node stats
    //     uptime_percentage: 99.8,
    //     blocks_validated: 1250,
    //     total_rewards_earned: 450.75,
    //     last_active_at: "2026-01-16T11:00:00Z",
    // },
    {
        node_id: "VAL_4afe3ab27e7f32d1",
        node_type: "FULL_NODE",
        status: "ACTIVE",
        endpoint: "fullnode-user.icl.network:7051",
        stake_amount: 3500,
        owner_wallet: "WALLET_dev_001",
        owner_name: "Budi Santoso",
        created_at: "2026-01-12T14:00:00Z",
        activated_at: "2026-01-12T15:00:00Z",
        // Node stats
        uptime_percentage: 98.5,
        blocks_synced: 5000,
        total_rewards_earned: 125.25,
        last_active_at: "2026-01-16T10:55:00Z",
    },
];

// ============================================
// Mock Transaction History
// ============================================
export const mockTransactionHistory = [
    {
        tx_id: "d1aa1bac639a602c9474df28ae4bd0eac8079f8a719a1a897e877870117a165e",
        type: "GASS_FEE",
        from_wallet: "0x305ba682",
        to_wallet: "0xe455e846",
        amount: 0.20,
        fee: 0,
        status: "SUCCESS",
        description: "PROTOCOL FEE",
        created_at: "2026-01-16T14:30:00Z",
    },
    {
        tx_id: "cd9385eeba86190800fbdec97b42326b278084b5c310c36c54eabf0a63eae2c9",
        type: "GASS_FEE",
        from_wallet: "0x305ba565",
        to_wallet: "0x305ba3432",
        amount: 1,
        fee: 0,
        status: "SUCCESS",
        description: "L2 Transaction Fee - Trash Management App",
        created_at: "2026-01-16T08:00:00Z",
    },
    {
        tx_id: "2a82f7e2d596dfd9ac87fd167c0f7e3a725c1b17b3801952d37b9eea327b3d5c",
        type: "GASS_FEE",
        from_wallet: "0x305b3432",
        to_wallet: "0xRECIPIENT123abc",
        amount: 0.80,
        fee: 0,
        status: "SUCCESS",
        description: "NODE FEE",
        created_at: "2026-01-15T14:30:00Z",
    },
];

// ============================================
// Mock Node Applications
// ============================================
export const mockNodeApplications = [
    // {
    //     application_id: "APP_node_val_001",
    //     node_type: "VALIDATOR",
    //     status: "APPROVED",
    //     requested_stake: 10000,
    //     endpoint: "validator.example.com:7051",
    //     submitted_at: "2026-01-10T10:00:00Z",
    //     approved_at: "2026-01-12T14:30:00Z",
    //     node_id: "VAL_001",
    // },
    {
        application_id: "APP_node_fn_001",
        node_type: "FULL_NODE",
        status: "REJECTED",
        requested_stake: 3500,
        endpoint: "fullnode.example.com:7051",
        submitted_at: "2026-01-15T08:30:00Z",
    },
];

// ============================================
// Helper: Calculate vote progress
// ============================================
export const getVoteProgress = (vote: typeof mockPendingVotes[0]) => {
    const validatorPercent = vote.validator_total > 0
        ? Math.round((vote.validator_approve / vote.validator_total) * 100)
        : 0;
    const fullnodePercent = vote.fullnode_total > 0
        ? Math.round((vote.fullnode_approve / vote.fullnode_total) * 100)
        : 0;

    return {
        validatorPercent,
        fullnodePercent,
        validatorMet: validatorPercent >= vote.threshold_validator,
        fullnodeMet: fullnodePercent >= vote.threshold_fullnode,
        thresholdMet: validatorPercent >= vote.threshold_validator && fullnodePercent >= vote.threshold_fullnode,
    };
};
