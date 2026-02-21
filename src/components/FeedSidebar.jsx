import { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../hooks/useAuth';

function timeAgo(dateStr) {
    const now = Date.now();
    const past = new Date(dateStr).getTime();
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ACTIVITY_ICONS = {
    note_created: { icon: 'add_circle', color: 'bg-primary/10 text-primary' },
    note_updated: { icon: 'update', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' },
    pod_created: { icon: 'create_new_folder', color: 'bg-primary/10 text-primary' },
    member_joined: { icon: 'person_add', color: 'bg-green-100 dark:bg-green-900/30 text-green-500' },
    default: { icon: 'circle', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
};

export default function FeedSidebar() {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchActivity = async () => {
            setLoading(true);
            try {
                // Fetch the most recently updated notes as the activity feed
                const { data: notes, error } = await supabase
                    .from('notes')
                    .select('id, title, updated_at, created_at')
                    .order('updated_at', { ascending: false })
                    .limit(8);

                if (error) throw error;

                const items = (notes || []).map(note => {
                    const isNew = note.created_at === note.updated_at ||
                        Math.abs(new Date(note.created_at) - new Date(note.updated_at)) < 5000;
                    return {
                        id: note.id,
                        type: isNew ? 'note_created' : 'note_updated',
                        label: isNew ? 'You created' : 'You updated',
                        noteTitle: note.title || 'Untitled',
                        time: note.updated_at,
                    };
                });

                setActivities(items);
            } catch (err) {
                console.error('Activity feed error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();

        // Realtime subscription on notes table for live updates
        const channel = supabase
            .channel('feed-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
                fetchActivity();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    return (
        <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 hidden xl:flex flex-col flex-shrink-0 z-20">
            <div className="p-6 h-full flex flex-col gap-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    Activity Feed
                    <span className="material-symbols-outlined !text-lg text-slate-400">history</span>
                </h3>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                    {loading ? (
                        // Loading skeletons
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-4/5" />
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/3" />
                                </div>
                            </div>
                        ))
                    ) : activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                            <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700 mb-2">history</span>
                            <p className="text-sm text-slate-400">No activity yet. Start by creating a note!</p>
                        </div>
                    ) : (
                        activities.map(item => {
                            const { icon, color } = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.default;
                            return (
                                <div key={item.id} className="flex gap-3 items-start group">
                                    <div className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center ${color}`}>
                                        <span className="material-symbols-outlined !text-base">{icon}</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                                            <span className="font-bold">{item.label}</span>{' '}
                                            <span className="italic font-medium text-primary truncate">"{item.noteTitle}"</span>
                                        </p>
                                        <span className="text-[10px] text-slate-400 mt-1">{timeAgo(item.time)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Tip */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Pro Tip</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                            Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold">S</kbd> inside the note editor to save instantly.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
