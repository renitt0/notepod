import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';

export default function NoteEditor() {
    const { id: noteId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [note, setNote] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [readerMode, setReaderMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    // Determine useNotes context from the note's pod_id once loaded
    const { updateNote, deleteNote } = useNotes(note?.pod_id);

    const fetchNote = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .single();

        if (error || !data) {
            console.error('Note not found');
            navigate('/dashboard');
            return;
        }

        setNote(data);
        setTitle(data.title);
        setContent(data.content ?? '');

        // Fetch user role for this pod
        if (data.pod_id) {
            const { data: membership } = await supabase
                .from('pod_members')
                .select('role')
                .eq('pod_id', data.pod_id)
                .eq('user_id', user.id)
                .single();
            setUserRole(membership?.role ?? null);
        }

        setLoading(false);
    }, [noteId, user]);

    useEffect(() => {
        fetchNote();
    }, [fetchNote]);

    const isReadOnly = userRole === 'read_only';
    const editDisabled = isReadOnly || readerMode;

    const handleSave = async () => {
        if (isReadOnly) return;
        setSaving(true);
        try {
            await updateNote(noteId, { title, content });
        } catch (err) {
            console.error('Failed to save:', err);
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (isReadOnly) return;
        try {
            await deleteNote(noteId);
            navigate(-1);
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    if (loading) {
        return <p className="text-sm text-gray-500">Loading note...</p>;
    }

    return (
        <div className="max-w-3xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                    ← Back
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setReaderMode(!readerMode)}
                        className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                    >
                        {readerMode ? 'Edit mode' : 'Reader mode'}
                    </button>

                    {!isReadOnly && (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Title */}
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={editDisabled}
                placeholder="Note title"
                className="w-full text-xl font-semibold text-gray-900 mb-4 border-none outline-none bg-transparent disabled:text-gray-700"
            />

            {/* Content */}
            {editDisabled ? (
                <div className="prose prose-sm text-gray-800 whitespace-pre-wrap min-h-[300px]">
                    {content || 'No content yet.'}
                </div>
            ) : (
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing..."
                    className="w-full min-h-[400px] text-sm text-gray-800 border border-gray-200 rounded p-3 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            )}
        </div>
    );
}
