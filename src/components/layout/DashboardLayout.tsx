import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50/50 relative flex overflow-hidden">
            {/* Subtle background decoration */}
            {/* <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-100/30 rounded-full blur-[100px] opacity-60" />
            </div> */}

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-h-screen relative z-10 transition-[margin] duration-300 cubic-bezier(0.4, 0, 0.2, 1)">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full animate-fade-in-up">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="py-6 px-4 md:px-6 lg:px-8 text-center border-t border-gray-200/60 bg-white/40 backdrop-blur-sm">
                    <p className="text-xs text-gray-500 font-medium">
                        ICL Network Platform © {new Date().getFullYear()} • <span className="text-gray-400">v1.2.0</span>
                    </p>
                </footer>
            </div>
        </div>
    );
}
