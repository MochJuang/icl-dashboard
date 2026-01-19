# ICL Dashboard - REST API Requirements

Dokumen ini menjelaskan kebutuhan REST API untuk fitur-fitur di ICL Dashboard.

---

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Semua endpoint (kecuali `/auth/*`) memerlukan JWT token:

```
Authorization: Bearer <token>
```

---

## 1. L2 Application API

### 1.1 Register L2 Application

Mendaftarkan aplikasi L2 baru untuk di-vote oleh validator/fullnode.

```
POST /l2/register
```

**Request Body:**
```json
{
    "wallet_address": "0x1234567890abcdef",
    "pin": "123456",
    "l2_register": {
        "name": "Trash Management App",
        "description": "Aplikasi pengelolaan sampah berbasis blockchain",
        "document_link": "https://docs.google.com/document/d/xxx",
        "gas_fee": 2.0
    }
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "data": {
        "l2_id": "L2_trash_mgmt_001",
        "name": "Trash Management App",
        "status": "PENDING",
        "created_at": "2026-01-15T08:30:00Z"
    }
}
```

---

### 1.2 Get My L2 Applications

Mengambil semua L2 yang dimiliki oleh developer yang sedang login.

```
GET /l2/my-l2s
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "l2s": [
            {
                "l2_id": "L2_trash_mgmt_001",
                "name": "Trash Management App",
                "description": "Aplikasi pengelolaan sampah berbasis blockchain untuk tracking pengumpulan, pemilahan, dan daur ulang sampah.",
                "developer_id": "DEV_001",
                "developer_name": "PT Lingkungan Bersih Indonesia",
                "gas_fee": 2.0,
                "status": "ACTIVE",
                "document_link": "https://docs.google.com/document/d/xxx",
                "created_at": "2026-01-15T08:30:00Z",
                "updated_at": "2026-01-15T14:30:00Z",
                "approved_at": "2026-01-15T14:30:00Z",
                "fee_distribution": {
                    "min_fee": 1.0,
                    "validator_share": 0.5,
                    "fullnode_share": 0.3,
                    "protocol_share": 0.2,
                    "developer_margin": 1.0
                },
                "basic_auth": {
                    "username": "trash_mgmt_l2",
                    "api_key": "tm_api_a1b2c3d4e5f6g7h8",
                    "generated_at": "2026-01-15T14:30:00Z"
                },
                "api_endpoint": "https://api.icl.network/v1/l2/L2_trash_mgmt_001"
            }
        ]
    }
}
```

**Status Values:**
- `PENDING` - Menunggu approval via voting
- `ACTIVE` - Sudah di-approve dan aktif
- `REJECTED` - Ditolak oleh voting
- `SUSPENDED` - Ditangguhkan

---

### 1.3 Get L2 by ID

Mengambil detail L2 berdasarkan ID.

```
GET /l2/:l2Id
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "l2_id": "L2_trash_mgmt_001",
        "name": "Trash Management App",
        "description": "...",
        "developer_id": "DEV_001",
        "developer_name": "PT Lingkungan Bersih Indonesia",
        "gas_fee": 2.0,
        "status": "ACTIVE",
        "document_link": "https://docs.google.com/document/d/xxx",
        "created_at": "2026-01-15T08:30:00Z",
        "approved_at": "2026-01-15T14:30:00Z",
        "fee_distribution": {
            "min_fee": 1.0,
            "validator_share": 0.5,
            "fullnode_share": 0.3,
            "protocol_share": 0.2,
            "developer_margin": 1.0
        },
        "basic_auth": {
            "username": "trash_mgmt_l2",
            "api_key": "tm_api_a1b2c3d4e5f6g7h8",
            "generated_at": "2026-01-15T14:30:00Z"
        },
        "api_endpoint": "https://api.icl.network/v1/l2/L2_trash_mgmt_001"
    }
}
```

---

### 1.4 Get L2 Transactions

Mengambil riwayat transaksi untuk L2 tertentu.

```
GET /l2/:l2Id/transactions?page=1&limit=10
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "transactions": [
            {
                "tx_id": "dbb8460765696de373538aa2458f949bda8d5209c46161246c69f1ff251df89c",
                "type": "SAVE_FILE",
                "timestamp": "2026-01-15T15:00:00Z",
                "fee": 2.0,
                "status": "SUCCESS",
                "caller_wallet": "0x1234...",
                "metadata": {
                    "file_cid": "QmExampleCID123",
                    "file_name": "report.pdf"
                }
            },
            {
                "tx_id": "abc123def456789xyz",
                "type": "GRANT_ACCESS",
                "timestamp": "2026-01-15T17:00:00Z",
                "fee": 0.5,
                "status": "SUCCESS",
                "caller_wallet": "0x1234...",
                "metadata": {
                    "file_cid": "QmExampleCID123",
                    "recipient_wallet": "0x5678..."
                }
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 25,
            "total_pages": 3
        }
    }
}
```

**Transaction Types:**
- `SAVE_FILE` - Menyimpan file baru
- `GRANT_ACCESS` - Memberikan akses file ke wallet lain
- `REVOKE_ACCESS` - Mencabut akses file
- `DELETE_FILE` - Menghapus referensi file

---

### 1.5 Get L2 Statistics

Mengambil statistik penggunaan L2.

```
GET /l2/:l2Id/stats
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "total_transactions": 156,
        "total_files": 45,
        "total_fees_collected": 312.5,
        "developer_earnings": 156.25,
        "active_users": 23,
        "daily_stats": [
            { "date": "2026-01-15", "transactions": 12, "fees": 24.0 },
            { "date": "2026-01-16", "transactions": 8, "fees": 16.0 },
            { "date": "2026-01-17", "transactions": 15, "fees": 30.0 }
        ]
    }
}
```

---

## 2. My Data (File Storage) API

### 2.1 Get My Files

Mengambil semua file yang di-upload oleh user.

```
GET /files/my-files?page=1&limit=10&l2_id=L2_trash_mgmt_001
```

**Query Parameters:**
- `page` (optional): Halaman, default 1
- `limit` (optional): Jumlah per halaman, default 10
- `l2_id` (optional): Filter by L2 application
- `is_private` (optional): Filter by visibility (true/false)
- `search` (optional): Search by filename or CID

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "files": [
            {
                "file_id": "FILE_001",
                "cid": "QmExampleCID1234567er3f0",
                "file_name": "example.pdf",
                "file_url": "https://storage.icl.network/files/example.pdf",
                "is_private": true,
                "file_size": 2458624,
                "created_at": "2026-01-15T10:30:00Z",
                "l2_id": "L2_trash_mgmt_001",
                "l2_name": "Trash Management App",
                "tx_id": "dbb8460765696de373538aa2458f949bda8d5209c46161246c69f1ff251df89c",
                "owner_wallet": "0x1234567890abcdef",
                "shared_with": [
                    {
                        "wallet_address": "0xe455e846...",
                        "shared_at": "2026-01-16T14:00:00Z"
                    }
                ],
                "metadata": {
                    "description": "Laporan pengumpulan sampah bulan Januari 2026",
                    "tags": ["laporan", "januari", "2026"],
                    "mime_type": "application/pdf"
                }
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 10,
            "total": 45,
            "total_pages": 5
        }
    }
}
```

---

### 2.2 Get File by ID

Mengambil detail file berdasarkan ID.

```
GET /files/:fileId
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "file_id": "FILE_001",
        "cid": "QmExampleCID1234567er3f0",
        "file_name": "example.pdf",
        "file_url": "https://storage.icl.network/files/example.pdf",
        "is_private": true,
        "file_size": 2458624,
        "created_at": "2026-01-15T10:30:00Z",
        "l2_id": "L2_trash_mgmt_001",
        "l2_name": "Trash Management App",
        "tx_id": "dbb8460765696de373538aa2458f949bda8d5209c46161246c69f1ff251df89c",
        "owner_wallet": "0x1234567890abcdef",
        "shared_with": [
            {
                "wallet_address": "0xe455e846...",
                "shared_at": "2026-01-16T14:00:00Z"
            }
        ],
        "metadata": {
            "description": "Laporan pengumpulan sampah bulan Januari 2026",
            "tags": ["laporan", "januari", "2026"],
            "mime_type": "application/pdf"
        }
    }
}
```

---

### 2.3 Share File

Memberikan akses file ke wallet lain.

```
POST /files/:fileId/share
```

**Request Body:**
```json
{
    "wallet_address": "0x1234567890abcdef",
    "pin": "123456",
    "recipient_wallet": "0xe455e846abcd1234"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "share_id": "SHARE_001",
        "file_id": "FILE_001",
        "recipient_wallet": "0xe455e846abcd1234",
        "shared_at": "2026-01-16T14:00:00Z",
        "tx_id": "share_tx_123456"
    }
}
```

---

### 2.4 Revoke File Access

Mencabut akses file dari wallet tertentu.

```
POST /files/:fileId/revoke
```

**Request Body:**
```json
{
    "wallet_address": "0x1234567890abcdef",
    "pin": "123456",
    "recipient_wallet": "0xe455e846abcd1234"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "revoked": true,
        "file_id": "FILE_001",
        "recipient_wallet": "0xe455e846abcd1234",
        "revoked_at": "2026-01-17T10:00:00Z",
        "tx_id": "revoke_tx_789012"
    }
}
```

---

### 2.5 Download File

Download file (jika memiliki akses).

```
GET /files/:fileId/download
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
- `200 OK`: Binary file stream dengan header `Content-Disposition`
- `403 Forbidden`: Tidak memiliki akses ke file
- `404 Not Found`: File tidak ditemukan

---

## 3. Developer API

### 3.1 Apply for Developer Status

Mengajukan diri sebagai developer L2.

```
POST /developer/apply
```

**Request Body:**
```json
{
    "wallet_address": "0x1234567890abcdef",
    "pin": "123456",
    "developer_apply": {
        "company_name": "PT Lingkungan Bersih Indonesia",
        "company_description": "Perusahaan teknologi lingkungan",
        "website": "https://lingkunganbersih.co.id",
        "contact_email": "dev@lingkunganbersih.co.id",
        "document_link": "https://docs.google.com/document/d/xxx"
    }
}
```

**Response (201 Created):**
```json
{
    "success": true,
    "data": {
        "application_id": "DEV_APP_001",
        "status": "PENDING",
        "created_at": "2026-01-15T08:00:00Z"
    }
}
```

---

### 3.2 Get My Developer Application

Mengambil status aplikasi developer.

```
GET /developer/my-application
```

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "application_id": "DEV_APP_001",
        "developer_id": "DEV_001",
        "company_name": "PT Lingkungan Bersih Indonesia",
        "company_description": "Perusahaan teknologi lingkungan",
        "website": "https://lingkunganbersih.co.id",
        "contact_email": "dev@lingkunganbersih.co.id",
        "document_link": "https://docs.google.com/document/d/xxx",
        "status": "APPROVED",
        "created_at": "2026-01-15T08:00:00Z",
        "approved_at": "2026-01-15T12:00:00Z",
        "approved_by": "OWNER"
    }
}
```

**Status Values:**
- `PENDING` - Menunggu approval
- `APPROVED` - Sudah di-approve, bisa register L2
- `REJECTED` - Ditolak

---

## 4. Error Responses

Semua error menggunakan format yang konsisten:

```json
{
    "success": false,
    "error": {
        "code": "INVALID_PIN",
        "message": "PIN yang dimasukkan salah",
        "details": {}
    }
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Token tidak valid atau expired |
| `FORBIDDEN` | 403 | Tidak memiliki akses |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `INVALID_PIN` | 400 | PIN salah |
| `INVALID_REQUEST` | 400 | Request body tidak valid |
| `INSUFFICIENT_BALANCE` | 400 | Saldo tidak cukup |
| `DUPLICATE_ENTRY` | 409 | Data sudah ada |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 5. API Endpoint Summary

| Feature | Method | Endpoint | Status |
|---------|--------|----------|--------|
| **L2 Application** ||||
| Register L2 | POST | `/l2/register` | ✅ Implemented |
| Get My L2s | GET | `/l2/my-l2s` | ✅ Implemented |
| Get L2 by ID | GET | `/l2/:l2Id` | ✅ Implemented |
| Get L2 Transactions | GET | `/l2/:l2Id/transactions` | ❌ **TODO** |
| Get L2 Stats | GET | `/l2/:l2Id/stats` | ❌ **TODO** |
| **My Data (Files)** ||||
| Get My Files | GET | `/files/my-files` | ❌ **TODO** |
| Get File by ID | GET | `/files/:fileId` | ❌ **TODO** |
| Share File | POST | `/files/:fileId/share` | ❌ **TODO** |
| Revoke Access | POST | `/files/:fileId/revoke` | ❌ **TODO** |
| Download File | GET | `/files/:fileId/download` | ❌ **TODO** |
| **Developer** ||||
| Apply Developer | POST | `/developer/apply` | ✅ Implemented |
| Get My Application | GET | `/developer/my-application` | ✅ Implemented |

---

## 6. TypeScript Interfaces

```typescript
// L2 Application
interface L2Application {
    l2_id: string;
    name: string;
    description: string;
    developer_id: string;
    developer_name: string;
    gas_fee: number;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
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

// L2 Transaction
interface L2Transaction {
    tx_id: string;
    type: 'SAVE_FILE' | 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'DELETE_FILE';
    timestamp: string;
    fee: number;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    caller_wallet: string;
    metadata?: Record<string, string>;
}

// File Record
interface FileRecord {
    file_id: string;
    cid: string;
    file_name: string;
    file_url: string;
    is_private: boolean;
    file_size: number;
    created_at: string;
    l2_id: string;
    l2_name: string;
    tx_id: string;
    owner_wallet: string;
    shared_with: {
        wallet_address: string;
        shared_at: string;
    }[];
    metadata: {
        description?: string;
        tags?: string[];
        mime_type?: string;
    };
}

// Developer Application
interface DeveloperApplication {
    application_id: string;
    developer_id?: string;
    company_name: string;
    company_description: string;
    website: string;
    contact_email: string;
    document_link: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
    approved_at?: string;
    approved_by?: string;
    rejection_reason?: string;
}
```
