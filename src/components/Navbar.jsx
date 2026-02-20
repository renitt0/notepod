import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { MenuIcon, SearchIcon, LightModeIcon, DarkModeIcon } from './Icons';

export default function Navbar({ onMenuClick }) {
    const { user, profile } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const displayName = profile?.username || user?.email || 'User';
    const initial = displayName.charAt(0).toUpperCase();
    const hasAvatar = !!profile?.avatar_url;

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/dashboard?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0 transition-all">

            {/* Mobile: Hamburger */}
            <div className="flex items-center gap-4 lg:hidden mr-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <MenuIcon className="size-6" />
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <SearchIcon className="size-5" />
                    </div>
                    <input
                        className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-full py-2 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all outline-none"
                        placeholder="Search notes..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4 ml-4 lg:ml-6">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? <LightModeIcon className="size-6" /> : <DarkModeIcon className="size-6" />}
                </button>

                <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-800 hidden sm:block"></div>

                {/* Profile Link */}
                <Link to="/settings" className="flex items-center gap-2 group cursor-pointer">
                    <div
                        className={`size-9 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all relative overflow-hidden flex items-center justify-center ${hasAvatar ? 'bg-cover bg-center bg-slate-200 dark:bg-slate-700' : 'bg-primary text-white'}`}
                        style={hasAvatar ? { backgroundImage: `url('${profile.avatar_url}')` } : {}}
                    >
                        {!hasAvatar && (
                            <span className="text-sm font-bold">{initial}</span>
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}
