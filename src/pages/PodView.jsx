import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePods } from '../hooks/usePods';
import { useNotes } from '../hooks/useNotes';
import { canEdit, canManageMembers } from '../utils/roleHelpers';
import MemberManagerModal from '../components/MemberManagerModal';

export default function PodView() {
    const { id: podId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        pods,
        fetchPodMembers,
        addMemberByUsername,
        removeMember,
        updateMemberRole,
    } = usePods();
    const { notes, loading: notesLoading, createNote } = useNotes(podId);

    const [showMembers, setShowMembers] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [creating, setCreating] = useState(false);

    const pod = pods.find((p) => p.id === podId);
    const userRole = pod?.role;

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            const note = await createNote({
                title: newTitle.trim(),
                content: '',
                pod_id: podId,
            });
            setNewTitle('');
            navigate(`/note/${note.id}`);
        } catch (err) {
            console.error('Failed to create note:', err);
        }
        setCreating(false);
    };

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    {pod?.name ?? 'Pod'}
                </h2>

                {canManageMembers(userRole) && (
                    <button
                        onClick={() => setShowMembers(true)}
                        className="text-sm text-indigo-600 hover:underline cursor-pointer"
                    >
                        Manage Members
                    </button>
                )}
            </div>

            {/* Create note */}
            {canEdit(userRole) && (
                <form onSubmit={handleCreateNote} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="New note title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={creating}
                        className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                    >
                        {creating ? 'Creating...' : 'New Note'}
                    </button>
                </form>
            )}

            {/* Notes list */}
            {notesLoading ? (
                <p className="text-sm text-gray-500">Loading notes...</p>
            ) : notes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes in this pod yet.</p>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {notes.map((note) => (
                        <li key={note.id}>
                            <button
                                onClick={() => navigate(`/note/${note.id}`)}
                                className="w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <span className="text-sm font-medium text-gray-900">
                                    {note.title || 'Untitled'}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Member manager modal */}
            <MemberManagerModal
                isOpen={showMembers}
                onClose={() => setShowMembers(false)}
                podId={podId}
                fetchPodMembers={fetchPodMembers}
                addMemberByUsername={addMemberByUsername}
                removeMember={removeMember}
                updateMemberRole={updateMemberRole}
            />
        </div>
    );
}
