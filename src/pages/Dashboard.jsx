import { useState } from 'react';
import { usePods } from '../hooks/usePods';
import PodCard from '../components/PodCard';

export default function Dashboard() {
    const { pods, loading, createPod } = usePods();
    const [newPodName, setNewPodName] = useState('');
    const [creating, setCreating] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newPodName.trim()) return;
        setCreating(true);
        try {
            await createPod(newPodName.trim());
            setNewPodName('');
        } catch (err) {
            console.error('Failed to create pod:', err);
        }
        setCreating(false);
    };

    return (
        <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Pods</h2>

            {/* Create pod form */}
            <form onSubmit={handleCreate} className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="New pod name"
                    value={newPodName}
                    onChange={(e) => setNewPodName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="submit"
                    disabled={creating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                    {creating ? 'Creating...' : 'Create Pod'}
                </button>
            </form>

            {/* Pod grid */}
            {loading ? (
                <p className="text-sm text-gray-500">Loading pods...</p>
            ) : pods.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No pods yet. Create one to get started.
                </p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {pods.map((pod) => (
                        <PodCard key={pod.id} pod={pod} />
                    ))}
                </div>
            )}
        </div>
    );
}
