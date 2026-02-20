import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabaseClient';

export default function Settings() {
    const { user, profile, setProfile } = useAuth();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
        }
    }, [profile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const updates = {
                id: user.id,
                username,
                updated_at: new Date(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            setProfile({ ...profile, ...updates });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark p-4 lg:p-10 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account preferences and profile.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Public Profile</h2>
                        <p className="text-sm text-slate-500 mt-1">This is how others see you in pods.</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                        <div className="flex items-center gap-6">
                            <div
                                className={`size-20 rounded-full flex items-center justify-center text-2xl font-bold uppercase relative overflow-hidden ${profile?.avatar_url ? 'bg-cover bg-center' : 'bg-primary/10 text-primary'}`}
                                style={profile?.avatar_url ? { backgroundImage: `url('${profile.avatar_url}')` } : {}}
                            >
                                {!profile?.avatar_url && (username ? username[0] : user?.email?.[0])}
                            </div>
                            <div>
                                <button type="button" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    Change Avatar
                                </button>
                                <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white"
                                placeholder="Enter your username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                            <input
                                type="text"
                                value={user?.email}
                                disabled
                                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
                        <p className="text-sm text-slate-500 mt-1">Irreversible actions regarding your account.</p>

                        <div className="mt-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Sign Out</h3>
                                <p className="text-sm text-slate-500">Sign out of your session on this device.</p>
                            </div>
                            <button onClick={handleSignOut} className="px-5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-full transition-colors">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
