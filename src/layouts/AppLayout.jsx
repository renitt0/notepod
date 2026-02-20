import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-[100dvh] overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary/30">
            {/* Sidebar with mobile props */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative h-full">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="flex-1 flex flex-col overflow-hidden relative" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
                    <Outlet />
                    {/* Overlay for mobile when sidebar is open */}
                    {isSidebarOpen && (
                        <div className="absolute inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsSidebarOpen(false)} />
                    )}
                </div>
            </div>
        </div>
    );
}
