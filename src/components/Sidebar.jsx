import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePods } from '../hooks/usePods';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';
import { useToast } from '../context/ToastContext';
import { LogoIcon, CloseIcon, AddCircleIcon, EditNoteIcon, FolderIcon, SettingsIcon } from './Icons';

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { pods, createPod, loading: podsLoading } = usePods();
    const { profile, loading: authLoading } = useAuth();
    const { notes } = useNotes();
    const toast = useToast();
    const [showCreatePod, setShowCreatePod] = useState(false);
    const [newPodName, setNewPodName] = useState('');
    const [newPodDesc, setNewPodDesc] = useState('');
    const [creating, setCreating] = useState(false);

    if (authLoading) {
        // Render skeleton or nothing for buttons logic, 
        // but Sidebar renders hooks outcome.
        // We can just set flags to false if loading.
    }

    const canCreate = profile?.role === 'admin' || profile?.role === 'creator' || profile?.role === 'editor';
    const canCreatePod = profile?.role === 'admin' || profile?.role === 'creator';

    // Only show if explicitly allowed. If loading, false.
    // If profile missing (and not loading), maybe allow? 
    // But better to be strict or user sees 'read_only' flash.
    // Let's rely on profile presence.
    const showPodBtn = !authLoading && (canCreatePod || !profile);
    const showNoteBtn = !authLoading && (canCreate || !profile);

    const allPods = pods || [];

    const handleCreatePod = async () => {
        if (!newPodName.trim()) return;
        setCreating(true);
        try {
            await createPod(newPodName.trim(), newPodDesc.trim());
            setNewPodName('');
            setNewPodDesc('');
            setShowCreatePod(false);
            toast.success(`Pod "${newPodName.trim()}" created!`);
        } catch (err) {
            toast.error('Failed to create pod: ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    // Responsive classes:
    // Mobile: fixed inset-y-0 left-0 z-50 transform transitions
    // Desktop: static w-64 block
    const sidebarClasses = `
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-background-dark/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:bg-transparent lg:dark:bg-transparent lg:shadow-none
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
    `;

    return (
        <>
            <aside className={sidebarClasses}>
                <div className="p-6 flex flex-col gap-8 h-full">
                    {/* Brand */}
                    <div className="flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={onClose}>
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                <LogoIcon className="size-5" />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">PodNotes</h1>
                        </Link>
                        {/* Close button for mobile */}
                        <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
                            <CloseIcon className="size-6" />
                        </button>
                    </div>

                    {/* Primary Actions */}
                    <div className="flex flex-col gap-2">
                        {showPodBtn && (
                            <button
                                onClick={() => {
                                    setShowCreatePod(true);
                                    // Don't close sidebar immediately so modal can show
                                }}
                                className="flex items-center gap-3 w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 px-4 rounded-full transition-all duration-200 shadow-sm shadow-primary/20"
                            >
                                <AddCircleIcon className="size-5" />
                                <span className="text-sm">Create Pod</span>
                            </button>
                        )}
                        {showNoteBtn && (
                            <Link
                                to="/note/new"
                                className="flex items-center gap-3 w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2.5 px-4 rounded-full transition-all"
                                onClick={onClose}
                            >
                                <EditNoteIcon className="size-5 text-slate-500" />
                                <span className="text-sm">New Note</span>
                            </Link>
                        )}
                    </div>

                    {/* Navigation Groups */}
                    <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                        {/* Your Pods */}
                        <div>
                            <h3 className="px-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Your Pods</h3>
                            <div className="flex flex-col gap-1">
                                {podsLoading ? (
                                    <div className="px-4 py-2 space-y-2">
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-2/3"></div>
                                    </div>
                                ) : allPods.length === 0 ? (
                                    <p className="px-4 text-xs text-slate-400 italic">No pods yet</p>
                                ) : (
                                    allPods.map(pod => (
                                        <Link
                                            key={pod.id}
                                            to={`/pod/${pod.id}`}
                                            className={`flex items-center gap-3 px-4 py-2 rounded-full font-medium transition-all group ${location.pathname === `/pod/${pod.id}`
                                                ? 'bg-primary/10 text-primary'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                            onClick={onClose}
                                        >
                                            <FolderIcon className={`size-5 ${location.pathname === `/pod/${pod.id}` ? 'fill-current' : ''}`} />
                                            <span className="text-sm truncate">{pod.name}</span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Sidebar */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                        <div className="px-4 mb-4 hidden lg:block">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col items-center flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl py-3 border border-slate-100 dark:border-slate-800">
                                    <span className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">{notes.length}</span>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Notes</span>
                                </div>
                                <div className="flex flex-col items-center flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl py-3 border border-slate-100 dark:border-slate-800">
                                    <span className="text-lg font-extrabold text-slate-900 dark:text-white leading-none">{allPods.length}</span>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Pods</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Link
                                to="/settings"
                                className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium transition-all w-full text-left"
                                onClick={onClose}
                            >
                                <SettingsIcon className="size-5 text-slate-500" />
                                <span className="text-sm">Settings</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Create Pod Modal - Ensure z-index is higher than sidebar if open */}
            {showCreatePod && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200" onClick={() => { setShowCreatePod(false); setNewPodName(''); setNewPodDesc(''); }}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Create New Pod</h2>
                        <p className="text-sm text-slate-500 mb-6">Organize your notes in collaborative workspaces.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Pod Name <span className="text-red-400">*</span></label>
                                <input
                                    value={newPodName}
                                    onChange={e => setNewPodName(e.target.value)}
                                    placeholder="e.g. Marketing Team"
                                    className="w-full px-4 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleCreatePod()}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                                <textarea
                                    value={newPodDesc}
                                    onChange={e => setNewPodDesc(e.target.value)}
                                    placeholder="What's this pod for?"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-sm resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setShowCreatePod(false); setNewPodName(''); setNewPodDesc(''); }} className="flex-1 h-11 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePod}
                                disabled={creating || !newPodName.trim()}
                                className="flex-1 h-11 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {creating ? 'Creating...' : 'Create Pod'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
