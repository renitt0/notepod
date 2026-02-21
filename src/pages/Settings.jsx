import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabaseClient';

export default function Settings() {
    const { user, profile, setProfile } = useAuth();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (1MB max)
        if (file.size > 1024 * 1024) {
            setMessage({ type: 'error', text: 'Avatar must be under 1MB.' });
            return;
        }
        // Validate type
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            setMessage({ type: 'error', text: 'Only JPG, PNG, GIF, or WebP images are allowed.' });
            return;
        }

        setAvatarUploading(true);
        setMessage(null);

        try {
            const ext = file.name.split('.').pop();
            const filePath = `avatars/${user.id}.${ext}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile with new avatar_url
            const { error: dbError } = await supabase
                .from('profiles')
                .upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date() });

            if (dbError) throw dbError;

            setProfile({ ...profile, avatar_url: publicUrl });
            setMessage({ type: 'success', text: 'Avatar updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Avatar upload failed: ' + err.message });
        } finally {
            setAvatarUploading(false);
            // Reset the file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const displayName = profile?.username || user?.email || 'User';
    const initial = displayName.charAt(0).toUpperCase();

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
                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div
                                    className="size-20 rounded-full flex items-center justify-center text-2xl font-bold uppercase relative overflow-hidden bg-cover bg-center"
                                    style={profile?.avatar_url
                                        ? { backgroundImage: `url('${profile.avatar_url}')` }
                                        : { background: 'var(--color-primary)', color: 'white' }
                                    }
                                >
                                    {!profile?.avatar_url && initial}
                                </div>
                                {avatarUploading && (
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white animate-spin">progress_activity</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    id="avatar-upload"
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">upload</span>
                                    {avatarUploading ? 'Uploading...' : 'Change Avatar'}
                                </label>
                                <p className="text-xs text-slate-400 mt-2">JPG, GIF, PNG or WebP. 1MB max.</p>
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
                            <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-100 dark:border-green-500/20'
                                : 'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20'
                                }`}>
                                <span className="material-symbols-outlined text-[18px]">
                                    {message.type === 'success' ? 'check_circle' : 'error'}
                                </span>
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

                {/* Danger Zone */}
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
