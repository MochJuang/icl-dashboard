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
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Wallets', href: '/wallets', icon: Wallet },
];

const developerNav = [
    { name: 'My L2s', href: '/l2', icon: Layers },
    { name: 'Register L2', href: '/l2/register', icon: Layers },
];

const nodeNav = [
    { name: 'Nodes', href: '/nodes', icon: Server },
    { name: 'Apply Node', href: '/nodes/apply', icon: Server },
    { name: 'Voting', href: '/voting', icon: Vote },
];

const ownerNav = [
    { name: 'Mint Coins', href: '/owner/mint', icon: Coins },
    { name: 'Treasury', href: '/owner/treasury', icon: Building2 },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();

    const NavLink = ({ item }: { item: { name: string; href: string; icon: React.ElementType } }) => {
        const isActive = location.pathname === item.href;
        return (
            <Link
                to={item.href}
                onClick={onClose}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
            >
                <item.icon className="h-5 w-5" />
                {item.name}
            </Link>
        );
    };

    const NavSection = ({ title, items }: { title: string; items: typeof navigation }) => (
        <div className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {title}
            </p>
            {items.map((item) => (
                <NavLink key={item.href} item={item} />
            ))}
        </div>
    );

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">ICL Chain</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <NavLink key={item.href} item={item} />
                        ))}
                    </div>

                    <NavSection title="Developer" items={developerNav} />
                    <NavSection title="Node Operator" items={nodeNav} />
                    <NavSection title="Owner" items={ownerNav} />

                    <div className="pt-4 border-t border-gray-200">
                        <NavLink item={{ name: 'Settings', href: '/settings', icon: Settings }} />
                    </div>
                </nav>
            </aside>
        </>
    );
}
