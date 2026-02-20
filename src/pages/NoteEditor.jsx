import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { useAuth } from '../hooks/useAuth';

export default function NoteEditor() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const podIdFromQuery = searchParams.get('podId');
    const { createNote, updateNote, deleteNote, notes, fetchNotes, loading: notesLoading } = useNotes();
    const { profile } = useAuth();

    // Editor State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // UI State (Reader Mode)
    const [fontSize, setFontSize] = useState(18);
    const [lineHeight, setLineHeight] = useState(1.6);
    const [fontStyle, setFontStyle] = useState('sans'); // 'sans' or 'serif'
    const [showTypography, setShowTypography] = useState(true);

    const isNew = id === 'new' || !id;
    const isReadOnly = profile?.role === 'read_only';

    // Word count
    const wordCount = useMemo(() => {
        return content.trim() ? content.trim().split(/\s+/).length : 0;
    }, [content]);

    // Load Note Data
    useEffect(() => {
        if (!isNew && notes.length > 0) {
            const found = notes.find(n => n.id === id);
            if (found) {
                setTitle(found.title || '');
                setContent(found.content || '');
            }
        }
    }, [id, notes, isNew]);

    // Fetch notes if we don't have the current note
    useEffect(() => {
        if (!isNew && notes.length === 0) {
            fetchNotes();
        }
    }, [isNew, notes.length, fetchNotes]);

    const handleSave = async () => {
        if (isReadOnly) return;
        setLoading(true);
        setSaved(false);
        try {
            if (isNew) {
                const newNote = await createNote(title || 'Untitled', content, podIdFromQuery);
                navigate(`/note/${newNote.id}`, { replace: true });
            } else {
                await updateNote(id, { title, content });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error(error);
            alert('Failed to save: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isNew || isReadOnly) return;
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            await deleteNote(id);
            navigate('/dashboard', { replace: true });
        } catch (error) {
            alert('Failed to delete: ' + error.message);
        }
    };

    // Keyboard shortcut: Ctrl+S to save
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [title, content, isNew, id]);

    const statusText = loading ? 'Saving...' : saved ? 'Saved!' : isNew ? 'New Draft' : 'Draft';

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-background-dark">
            {/* Top Navigation Bar */}
            <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 px-4 lg:px-6 backdrop-blur-md z-20 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {notesLoading ? 'Loading...' : (title || 'Untitled Note')}
                        </h1>
                        <span className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${saved ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {statusText}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTypography(!showTypography)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${showTypography ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Toggle Typography Settings"
                    >
                        <span className="material-symbols-outlined text-[20px]">text_fields</span>
                    </button>
                    {!isReadOnly && !isNew && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Note"
                        >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    )}
                    {!isReadOnly && (
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
                        >
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            <span>{loading ? 'Saving...' : 'Save'}</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Side Panel (Typography Settings) */}
                {showTypography && (
                    <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar flex-shrink-0 transition-all">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Typography</h3>
                            <div className="space-y-8">
                                {/* Font Size */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Font Size</label>
                                        <span className="text-xs text-slate-400 font-mono">{fontSize}px</span>
                                    </div>
                                    <input
                                        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                        type="range" min="12" max="32" step="1"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                        <span>Small</span>
                                        <span>Large</span>
                                    </div>
                                </div>
                                {/* Line Height */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Line Height</label>
                                        <span className="text-xs text-slate-400 font-mono">{lineHeight}</span>
                                    </div>
                                    <input
                                        className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                        type="range" min="1.0" max="2.5" step="0.1"
                                        value={lineHeight}
                                        onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                        <span>Tight</span>
                                        <span>Loose</span>
                                    </div>
                                </div>
                                {/* Font Style Toggle */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Font Style</label>
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                        <button
                                            onClick={() => setFontStyle('sans')}
                                            className={`flex items-center justify-center gap-2 py-2 rounded-lg shadow-sm text-sm font-semibold transition-colors ${fontStyle === 'sans'
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                                                : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                                            <span>Sans</span>
                                        </button>
                                        <button
                                            onClick={() => setFontStyle('serif')}
                                            className={`flex items-center justify-center gap-2 py-2 rounded-lg shadow-sm text-sm font-semibold transition-colors ${fontStyle === 'serif'
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                                                : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">serif</span>
                                            <span>Serif</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                )}

                {/* Editor Content Area */}
                <section className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-background-dark p-6 lg:p-24 relative">
                    <div className="max-w-[720px] mx-auto space-y-12 h-full">
                        {/* Title Area */}
                        <div className="space-y-4">
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white placeholder-slate-200 dark:placeholder-slate-800 outline-none"
                                placeholder="Title"
                                readOnly={isReadOnly || notesLoading}
                            />
                            <div className="flex items-center gap-4 text-slate-400 text-sm font-medium border-b border-slate-100 dark:border-slate-800 pb-6">
                                <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <span className="size-1 rounded-full bg-slate-300"></span>
                                <span>{wordCount.toLocaleString()} words</span>
                            </div>
                        </div>

                        {/* Writing Canvas */}
                        <textarea
                            className={`w-full h-[calc(100%-200px)] resize-none outline-none border-none bg-transparent text-slate-700 dark:text-slate-300 ${fontStyle === 'serif' ? 'font-serif' : 'font-display'}`}
                            style={{
                                fontSize: `${fontSize}px`,
                                lineHeight: lineHeight
                            }}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={notesLoading ? 'Loading content...' : 'Start writing...'}
                            readOnly={isReadOnly || notesLoading}
                        />
                    </div>
                </section>
            </div>

            {/* Status Bar */}
            <footer className="h-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark px-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest z-20 flex-shrink-0">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${loading ? 'bg-yellow-500' : saved ? 'bg-primary' : 'bg-slate-300'} ${loading ? 'animate-pulse' : ''}`}></span>
                        {statusText}
                    </span>
                    <span>{fontStyle === 'sans' ? 'Inter Sans-Serif' : 'Lora Serif'}</span>
                </div>
                <div className="flex gap-4">
                    <span>UTF-8</span>
                    <span>{wordCount} words</span>
                    <button onClick={() => setShowTypography(!showTypography)} className="hover:text-primary transition-colors">
                        {showTypography ? 'Focus Mode' : 'Exit Focus'}
                    </button>
                </div>
            </footer>
        </div>
    );
}
