import { Link, useLocation } from 'react-router-dom';
import {
    Wallet,
    LayoutDashboard,
    Server,
    Vote,
    Layers,
    Coins,
    Building2,
    Settings,
    X,
    ServerCog,
    ChevronRight,
    CreditCard,
    History,
    FileText,
    Code,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useMemo } from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const { hasWalletType, activeWallet } = useAuth();

    // Base navigation - always visible
    const baseNav: NavItem[] = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Wallets', href: '/wallets', icon: Wallet },
        { name: 'Transactions', href: '/transactions', icon: History },
    ];

    // Network navigation - always visible (global)
    const networkNav: NavItem[] = [
        { name: 'Active Nodes', href: '/nodes/active', icon: Server },
        { name: 'Apply Node', href: '/nodes/apply', icon: ServerCog },
        { name: 'Register L2', href: '/l2/register', icon: Layers },
    ];

    // Applications navigation - general menu for everyone
    const applicationsNav: NavItem[] = [
        { name: 'Node Applications', href: '/applications/node', icon: FileText },
        { name: 'Developer Applications', href: '/applications/developer', icon: Code },
    ];

    // Developer navigation - only if has DEVELOPER wallet
    const developerNav: NavItem[] = useMemo(() => {
        if (!hasWalletType('DEVELOPER')) return [];
        return [
            { name: 'My L2s', href: '/l2', icon: Layers },
        ];
    }, [hasWalletType]);

    // Node navigation - different items based on wallet types
    const nodeNav: NavItem[] = useMemo(() => {
        const items: NavItem[] = [];

        // If has NODE_WALLET, can manage nodes and vote
        if (hasWalletType('NODE_WALLET')) {
            items.push({ name: 'My Nodes', href: '/nodes', icon: Server });
            items.push({ name: 'Voting', href: '/voting', icon: Vote });
        }

        return items;
    }, [hasWalletType]);

    // Owner navigation - only if has OWNER wallet
    const ownerNav: NavItem[] = useMemo(() => {
        if (!hasWalletType('OWNER')) return [];
        return [
            { name: 'Mint Coins', href: '/owner/mint', icon: Coins },
            { name: 'Treasury', href: '/owner/treasury', icon: Building2 },
        ];
    }, [hasWalletType]);

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = location.pathname === item.href;
        return (
            <Link
                to={item.href}
                onClick={onClose}
                className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                    'active:scale-[0.98]',
                    isActive
                        ? 'bg-gradient-to-r from-primary-500/10 to-transparent text-primary-600'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
            >
                {/* Active indicator bar */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                )}

                <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-300",
                    isActive ? "text-primary-500" : "text-gray-400 group-hover:text-gray-600"
                )} />
                <span className="flex-1">{item.name}</span>
                {isActive && (
                    <ChevronRight className="h-4 w-4 text-primary-500 animate-in fade-in slide-in-from-left-1 md:block hidden" />
                )}
            </Link>
        );
    };

    const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => {
        if (items.length === 0) return null;

        return (
            <div className="space-y-1">
                <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {title}
                </p>
                {items.map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={cn(
                    "inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    'inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-100 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)',
                    'lg:translate-x-0',
                    'flex flex-col shadow-2xl lg:shadow-none',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo / Header */}
                <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100/50">
                    <Link to="/" className="flex items-center gap-3.5 group" onClick={onClose}>
                        <div className="relative h-10 w-10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300" />
                            <Layers className="relative h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">ICL Chain</span>
                            <span className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">Dashboard</span>
                        </div>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 -mr-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Active Wallet Card */}
                {activeWallet && (
                    <div className="px-4 pt-6 pb-2">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white shadow-xl shadow-gray-200/50">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
                            <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-20 h-20 rounded-full bg-primary-500/20 blur-xl" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            'w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]',
                                            activeWallet.status === 'ACTIVE' ? 'bg-green-400 text-green-400' : 'bg-gray-400 text-gray-400'
                                        )} />
                                        <span className="text-xs font-medium text-gray-300 tracking-wide">Active Wallet</span>
                                    </div>
                                    <CreditCard className="h-4 w-4 text-white/40" />
                                </div>
                                <div className="text-sm font-mono text-white/90 mb-1 truncate tracking-tight">
                                    {activeWallet.wallet_address}
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Balance</span>
                                        <span className="text-lg font-bold text-white tracking-tight">
                                            {activeWallet.balance.toLocaleString()} <span className="text-xs text-primary-400 font-normal">ICL</span>
                                        </span>
                                    </div>
                                    <span className="text-[10px] px-2 py-1 rounded bg-white/10 text-white/80 font-medium backdrop-blur-sm border border-white/10">
                                        {activeWallet.wallet_type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100">
                    <div className="space-y-1">
                        {baseNav.map((item) => (
                            <NavLink key={item.href} item={item} />
                        ))}
                    </div>

                    <NavSection title="Network Services" items={networkNav} />
                    <NavSection title="Applications" items={applicationsNav} />
                    <NavSection title="Node Operator" items={nodeNav} />
                    <NavSection title="Developer" items={developerNav} />
                    <NavSection title="Owner" items={ownerNav} />
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100/50 bg-gray-50/30">
                    <NavLink item={{ name: 'Settings', href: '/settings', icon: Settings }} />
                </div>
            </aside>
        </>
    );
}
