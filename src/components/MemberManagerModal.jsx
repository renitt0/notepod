import { useEffect, useState } from 'react';
import { ROLES, getRoleLabel, isCreator } from '../utils/roleHelpers';

const ROLE_OPTIONS = [
    { value: ROLES.READ_ONLY, label: 'Read Only' },
    { value: ROLES.EDITOR, label: 'Editor' },
    { value: ROLES.ADMIN, label: 'Admin' },
];

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
    const [role, setRole] = useState(ROLES.EDITOR);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [membersLoading, setMembersLoading] = useState(false);

    const loadMembers = async () => {
        setMembersLoading(true);
        try {
            const data = await fetchPodMembers(podId);
            setMembers(data);
        } catch {
            console.error('Failed to load members');
        } finally {
            setMembersLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setError('');
            setUsername('');
            loadMembers();
        }
    }, [isOpen, podId]);

    const handleAdd = async () => {
        if (!username.trim()) return;
        setError('');
        setLoading(true);
        try {
            await addMemberByUsername(podId, username, role);
            setUsername('');
            await loadMembers();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (memberId) => {
        setError('');
        try {
            await removeMember(podId, memberId);
            await loadMembers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        setError('');
        try {
            await updateMemberRole(podId, memberId, newRole);
            await loadMembers();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Members</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Invite and manage pod collaborators</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center size-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Add Member Form */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Invite by username</label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">@</span>
                                <input
                                    type="text"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    autoFocus
                                    className="w-full pl-7 pr-3 h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="h-10 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                {ROLE_OPTIONS.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAdd}
                                disabled={loading || !username.trim()}
                                className="h-10 px-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                )}
                                <span className="hidden sm:inline">Invite</span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-100 dark:border-red-500/20">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Member List */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Members
                            {members.length > 0 && (
                                <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full text-[10px]">
                                    {members.length}
                                </span>
                            )}
                        </label>

                        {membersLoading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : members.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-4">No members yet. Invite someone above.</p>
                        ) : (
                            <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                {members.map((member) => (
                                    <li
                                        key={member.id}
                                        className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
                                    >
                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="size-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold bg-primary/10 text-primary bg-cover bg-center"
                                                style={member.avatar_url ? { backgroundImage: `url('${member.avatar_url}')` } : {}}
                                            >
                                                {!member.avatar_url && (member.username?.[0] ?? '?').toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                @{member.username}
                                            </span>
                                        </div>

                                        {/* Role + Remove */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {isCreator(member.role) ? (
                                                <span className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-full">
                                                    {getRoleLabel(member.role)}
                                                </span>
                                            ) : (
                                                <>
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                        className="text-xs h-8 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 outline-none"
                                                    >
                                                        {ROLE_OPTIONS.map(r => (
                                                            <option key={r.value} value={r.value}>{r.label}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => handleRemove(member.id)}
                                                        className="flex items-center justify-center size-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Remove member"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">person_remove</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
