import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import L2Dashboard from './pages/L2Dashboard';
import L2Register from './pages/L2Register';
import NodeDashboard from './pages/NodeDashboard';
import NodeApply from './pages/NodeApply';
import NodeApplications from './pages/NodeApplications';
import DeveloperApplications from './pages/DeveloperApplications';
import TransactionHistory from './pages/TransactionHistory';
import Voting from './pages/Voting';
import OwnerMint from './pages/OwnerMint';
import Treasury from './pages/Treasury';
import ActiveNodes from './pages/ActiveNodes';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/wallets" element={<Wallets />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/l2" element={<L2Dashboard />} />
                <Route path="/l2/register" element={<L2Register />} />
                <Route path="/nodes" element={<NodeDashboard />} />
                <Route path="/nodes/active" element={<ActiveNodes />} />
                <Route path="/nodes/apply" element={<NodeApply />} />
                <Route path="/applications/node" element={<NodeApplications />} />
                <Route path="/applications/developer" element={<DeveloperApplications />} />
                <Route path="/voting" element={<Voting />} />
                <Route path="/owner/mint" element={<OwnerMint />} />
                <Route path="/owner/treasury" element={<Treasury />} />
                <Route path="/settings" element={<Dashboard />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
