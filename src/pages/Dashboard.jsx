import { Link, useSearchParams } from 'react-router-dom';
import FeedSidebar from '../components/FeedSidebar';
import PodCard from '../components/PodCard';
import { useNotes } from '../hooks/useNotes';
import { usePods } from '../hooks/usePods';
import Loader from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { useMemo } from 'react';
import { SearchOffIcon, DescriptionIcon, ArrowForwardIcon } from '../components/Icons';

export default function Dashboard() {
    const { notes, loading: notesLoading } = useNotes();
    const { pods, loading: podsLoading } = usePods();
    const { profile } = useAuth();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const filteredNotes = useMemo(() => {
        if (!query) return notes;
        const lowerQ = query.toLowerCase();
        return notes.filter(n =>
            (n.title?.toLowerCase() || '').includes(lowerQ) ||
            (n.content?.toLowerCase() || '').includes(lowerQ)
        );
    }, [notes, query]);

    if (notesLoading) {
        return <Loader text="Loading dashboard..." />;
    }

    return (
        <div className="flex h-full">
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {query ? `Search results for "${query}"` : (profile?.username ? `Welcome, ${profile.username}` : 'Recent Activity')}
                            </h2>
                            {!query && <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your latest notes and collaborative pods</p>}
                        </div>
                        <Link to="/note/new" className="self-start sm:self-auto px-4 py-2 text-sm font-semibold bg-primary text-white hover:bg-primary/90 rounded-full transition-all shadow-sm">
                            + New Note
                        </Link>
                    </div>

                    {/* Pods Section — only shown when not searching */}
                    {!query && !podsLoading && pods.length > 0 && (
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Your Pods</h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {pods.map(pod => <PodCard key={pod.id} pod={pod} />)}
                            </div>
                        </div>
                    )}

                    {/* Notes header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                            {query ? `Results for "${query}"` : 'Recent Notes'}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredNotes.length === 0 ? (
                            <div className="col-span-full text-center text-slate-400 py-16">
                                <span className="text-6xl mb-4 block text-slate-200 dark:text-slate-700 mx-auto w-fit">
                                    <SearchOffIcon className="size-20" />
                                </span>
                                <p className="text-lg font-semibold text-slate-500 mb-2">{query ? 'No matching notes found' : 'No notes yet'}</p>
                                {!query && (
                                    <>
                                        <p className="text-sm mb-6">Create your first note to get started!</p>
                                        <Link to="/note/new" className="inline-block px-6 py-3 bg-primary text-white rounded-full font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                                            Create Note
                                        </Link>
                                    </>
                                )}
                            </div>
                        ) : (
                            filteredNotes.map(note => (
                                <Link to={`/note/${note.id}`} key={note.id} className="group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all cursor-pointer block h-full flex flex-col">
                                    <div className="aspect-video w-full rounded-lg mb-4 bg-gradient-to-br from-primary/5 to-slate-100 dark:from-primary/10 dark:to-slate-800 flex items-center justify-center shrink-0">
                                        <DescriptionIcon className="text-3xl text-slate-300 dark:text-slate-600 size-10" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-slate-200 mb-1 group-hover:text-primary transition-colors truncate">{note.title || 'Untitled'}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4 flex-grow">{note.content ? note.content.substring(0, 100) : 'No content'}...</p>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] font-medium text-slate-400">
                                            {note.updated_at ? new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                                        </span>
                                        <ArrowForwardIcon className="text-[14px] text-slate-300 group-hover:text-primary transition-colors size-4" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <FeedSidebar />
        </div>
    );
}
