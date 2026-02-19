import { useEffect, useState } from 'react';
import { ROLES, getRoleLabel, isCreator } from '../utils/roleHelpers';

export default function MemberManagerModal({
    isOpen,
    onClose,
    podId,
    fetchPodMembers,
    addMemberByUsername,
    removeMember,
    updateMemberRole,
}) {
    const [members, setMembers] = useState([]);
    const [username, setUsername] = useState('');
    const [role, setRole] = useState(ROLES.READ_ONLY);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const loadMembers = async () => {
        try {
            const data = await fetchPodMembers(podId);
            setMembers(data);
        } catch {
            console.error('Failed to load members');
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadMembers();
        }
    }, [isOpen, podId]);

    const handleAdd = async () => {
        setError('');
        setLoading(true);
        try {
            await addMemberByUsername(podId, username, role);
            setUsername('');
            await loadMembers();
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleRemove = async (userId) => {
        try {
            await removeMember(podId, userId);
            await loadMembers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateMemberRole(podId, userId, newRole);
            await loadMembers();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Manage Members</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Add member form */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={ROLES.READ_ONLY}>Read Only</option>
                            <option value={ROLES.EDITOR}>Editor</option>
                            <option value={ROLES.ADMIN}>Admin</option>
                        </select>
                        <button
                            onClick={handleAdd}
                            disabled={loading || !username.trim()}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                        >
                            Add
                        </button>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    {/* Member list */}
                    <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                        {members.map((member) => (
                            <li
                                key={member.id}
                                className="flex items-center justify-between py-2"
                            >
                                <span className="text-sm text-gray-800">@{member.username}</span>
                                <div className="flex items-center gap-2">
                                    {isCreator(member.role) ? (
                                        <span className="text-xs text-gray-400">
                                            {getRoleLabel(member.role)}
                                        </span>
                                    ) : (
                                        <>
                                            <select
                                                value={member.role}
                                                onChange={(e) =>
                                                    handleRoleChange(member.id, e.target.value)
                                                }
                                                className="border border-gray-200 rounded text-xs px-1 py-0.5"
                                            >
                                                <option value={ROLES.READ_ONLY}>Read Only</option>
                                                <option value={ROLES.EDITOR}>Editor</option>
                                                <option value={ROLES.ADMIN}>Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleRemove(member.id)}
                                                className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
