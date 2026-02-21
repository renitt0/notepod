import { useParams, Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { usePods } from '../hooks/usePods';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';
import MemberManagerModal from '../components/MemberManagerModal';

export default function PodView() {
    const { id: podId } = useParams();
    const { notes, loading } = useNotes(podId);
    const { pods, fetchPodMembers, addMemberByUsername, removeMember, updateMemberRole } = usePods();
    const { profile } = useAuth();
    const [pod, setPod] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMembers, setShowMembers] = useState(false);
    const [memberCount, setMemberCount] = useState(null);

    const canManage = profile?.role === 'admin' || profile?.role === 'creator';
    const canCreate = profile?.role !== 'read_only';

    useEffect(() => {
        if (pods.length > 0) {
            const found = pods.find(p => p.id === podId);
            if (found) setPod(found);
        }
    }, [pods, podId]);

    // Fetch member count for header display
    useEffect(() => {
        if (podId) {
            fetchPodMembers(podId)
                .then(members => setMemberCount(members.length))
                .catch(() => setMemberCount(null));
        }
    }, [podId]);

    const filteredNotes = useMemo(() => {
        if (!searchQuery) return notes;
        const lowerQ = searchQuery.toLowerCase();
        return notes.filter(n =>
            (n.title?.toLowerCase() || '').includes(lowerQ) ||
            (n.content?.toLowerCase() || '').includes(lowerQ)
        );
    }, [notes, searchQuery]);

    return (
        <div className="layout-container flex h-full grow flex-col w-full relative">
            <header className="flex items-center justify-between gap-4 border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-4 lg:px-10 py-3 sticky top-0 z-10 flex-shrink-0">
                <div className="flex items-center gap-4 lg:gap-8 flex-1 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
                        <div className="size-8 flex items-center justify-center bg-primary text-white rounded-lg flex-shrink-0">
                            <span className="material-symbols-outlined">folder_shared</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex items-center gap-2 truncate">
                                {pod ? pod.name : 'Loading...'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium truncate">Workspace</p>
                        </div>
                    </div>
                    {/* Search Bar */}
                    <div className="hidden md:flex flex-col max-w-md w-full ml-4">
                        <div className="flex w-full items-center rounded-full bg-slate-100 dark:bg-slate-800 px-4 h-10 border border-transparent focus-within:border-primary/30 transition-all">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 outline-none"
                                placeholder="Search notes in pod..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                    {/* Real member count badge */}
                    {memberCount !== null && (
                        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[16px]">group</span>
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </div>
                    )}
                    {canManage && (
                        <button
                            onClick={() => setShowMembers(true)}
                            className="hidden sm:flex items-center justify-center rounded-full h-10 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                            Members
                        </button>
                    )}
                    {canCreate && (
                        <Link to={`/note/new?podId=${podId}`} className="flex items-center justify-center rounded-full size-10 lg:w-auto lg:px-4 bg-primary text-white text-sm font-bold gap-2 shadow-sm hover:opacity-90 transition-opacity">
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span className="hidden lg:inline">New Note</span>
                        </Link>
                    )}
                </div>
            </header>

            {/* Mobile Search - Visible only on small screens below header */}
            <div className="md:hidden px-4 py-2 bg-white dark:bg-background-dark border-b border-slate-100 dark:border-slate-800">
                <div className="flex w-full items-center rounded-full bg-slate-100 dark:bg-slate-800 px-4 h-10">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                    <input
                        className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 outline-none"
                        placeholder="Search notes..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-6 pb-20 custom-scrollbar">
                <div className="max-w-[1200px] mx-auto w-full">
                    {/* Notes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full">
                                <Loader text="Loading notes..." />
                            </div>
                        ) : filteredNotes.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-slate-400 text-lg mb-2">{searchQuery ? 'No matching notes' : 'No notes in this pod'}</p>
                                {!searchQuery && canCreate && (
                                    <Link to={`/note/new?podId=${podId}`} className="text-primary font-bold hover:underline">Create one now</Link>
                                )}
                            </div>
                        ) : (
                            filteredNotes.map(note => (
                                <Link to={`/note/${note.id}`} key={note.id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer h-full">
                                    <div className="w-full aspect-[16/9] bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm">Note</span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col gap-2 flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight truncate w-full">{note.title}</h3>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed flex-grow">
                                            {note.content ? note.content.substring(0, 150) : 'No content'}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400">
                                                    {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : 'Recent'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}

                        {/* Add New Note Card - Only show if not searching */}
                        {!searchQuery && canCreate && (
                            <Link to={`/note/new?podId=${podId}`} className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 group hover:border-primary/50 transition-all cursor-pointer min-h-[300px]">
                                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-[32px]">post_add</span>
                                </div>
                                <h4 className="text-slate-900 dark:text-white font-bold">Add New Note</h4>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <Link to={`/note/new?podId=${podId}`} className="fixed bottom-6 right-6 lg:hidden size-14 bg-primary rounded-full text-white shadow-lg flex items-center justify-center z-50 hover:scale-105 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[28px]">add</span>
            </Link>

            {/* Member Manager Modal */}
            <MemberManagerModal
                isOpen={showMembers}
                onClose={() => {
                    setShowMembers(false);
                    // Refresh member count after closing
                    fetchPodMembers(podId)
                        .then(members => setMemberCount(members.length))
                        .catch(() => { });
                }}
                podId={podId}
                fetchPodMembers={fetchPodMembers}
                addMemberByUsername={addMemberByUsername}
                removeMember={removeMember}
                updateMemberRole={updateMemberRole}
            />
        </div>
    );
}
