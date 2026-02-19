import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
    const { profile, signOut } = useAuth();

    return (
        <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-gray-900">Notepod</h1>

            <div className="flex items-center gap-4">
                {profile && (
                    <span className="text-sm text-gray-600">@{profile.username}</span>
                )}
                <button
                    onClick={signOut}
                    className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
                >
                    Sign out
                </button>
            </div>
        </header>
    );
}
