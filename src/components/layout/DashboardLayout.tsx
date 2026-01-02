import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar - fixed position, always visible on lg screens */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content wrapper - uses margin to offset for fixed sidebar on lg screens */}
            <div className="lg:pl-64">
                {/* Header - sticky at top */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Main content area */}
                <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-6xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
