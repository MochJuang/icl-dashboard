# ICL Dashboard - Hyperledger Fabric Client

A modern, premium-styled frontend dashboard for interacting with the ICL Hyperledger Fabric network. This application serves as the primary interface for users, node operators, and network owners to manage wallets, nodes, and governance.

## 🚀 Key Features

### 🔐 Authentication & Security
- **Multi-Wallet Support**: Manage multiple wallets (Regular, Node, Owner, Developer) under a single user account.
- **Role-Based Access Control**: Feature visibility and access restricted by wallet type and user role.
- **Secure Sessions**: JWT-based authentication with auto-logout and session management.

### 💼 Wallet Management
- **Unified Dashboard**: View total balance, locked assets, and active wallet stats at a glance.
- **Transfer**: Send ICL coins to other users with fee estimation and address validation.
- **Create Wallet**: Generate new wallets securely with PIN protection.
- **Detailed History**: Track transaction history and asset movements (planned).

### 🖥️ Node Operations
- **Node Dashboard**: Dedicated interface for node operators to monitor status and performance.
- **Node Registration**: streamlined application flow for becoming a Validator or Full Node.
- **Lifecycle Management**: Activate, deactivate, and manage node stakes directly from the UI.
- **Status Monitoring**: Real-time visibility into active network nodes and application status.

### 🗳️ Governance
- **Voting System**: Browse active proposals and cast votes using Node Wallets.
- **Proposal Tracking**: View vote status, deadlines, and results.

### 👑 Owner Functions
- **Treasury Management**: Exclusive dashboard for network owners to monitor total supply and circulation.
- **Minting**: Secure interface for minting new coins into circulation.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) with a custom premium design system
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest) for server state & caching
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `clsx` and `tailwind-merge` for dynamic class composition

## 🎨 UI/UX Standards

This project follows a strict "Premium Glassmorphism" design system:

### Layout & Spacing
- **8px Grid System**: All spacing (margins, padding, gaps) follows the `8px` scale (8, 16, 24, 32, 48...).
- **Max-Width**: Main content is contained within `max-w-7xl` (1280px) to ensure readability on large screens.
- **Grid Discipline**:
  - **Desktop (XL)**: 4-column stats, 3-column main content (2/1 split).
  - **Laptop (LG)**: Adaptive grids that respect sidebar width.
  - **Mobile**: Single-column vertical stacks for maximum usability.
- **Equal Heights**: Cards in the same row always share equal height (`h-full`) for visual balance.

### Visual Style
- **Glassmorphism**: Extensive use of `backdrop-blur`, semi-transparent backgrounds (`bg-white/80`), and subtle borders.
- **Gradients**: Brand-aligned gradients (Blue, Purple, Amber) used for emphasis and active states.
- **Feedback**: Smooth transitions (`duration-300`), hover lifts (`-translate-y-1`), and active scale effects.

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js > 18.x
- npm > 9.x

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd icl-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8080/api/v1
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```
This will generate optimized static files in the `dist` directory.

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── layout/         # Sidebar, Header, DashboardLayout
│   ├── ui/             # Primitives (Button, Card, Input, Badge)
│   └── wallet/         # Domain-specific (WalletCard, TransferModal)
├── context/            # React Context (Auth, Toast)
├── lib/                # Utilities and API client
│   ├── api.ts          # Centralized Axios API definitions
│   └── utils.ts        # Helper functions
├── pages/              # Route components (Dashboard, Wallets, etc.)
└── types/              # TypeScript interfaces (Postman-aligned)
```

## 🧪 Linting & formatting

```bash
# Run linting
npm run lint

# Check definitions
tsc -b
```

---
Built with ❤️ for the ICL Hyperledger Fabric Network.
