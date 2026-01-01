import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
            {/* Mobile menu button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Notifications */}
            <button className="p-2 rounded-md hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger-500" />
            </button>

            {/* User dropdown */}
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <Button variant="ghost" className="gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-600" />
                        </div>
                        <span className="hidden sm:block text-sm font-medium">
                            {user?.full_name || 'User'}
                        </span>
                    </Button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                        sideOffset={5}
                        align="end"
                    >
                        <DropdownMenu.Item className="px-3 py-2 text-sm text-gray-500 outline-none">
                            {user?.email}
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                        <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:bg-gray-100"
                            onClick={() => navigate('/settings')}
                        >
                            <User className="h-4 w-4" />
                            Profile
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 text-sm text-danger-500 outline-none cursor-pointer hover:bg-gray-100"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </header>
    );
}
