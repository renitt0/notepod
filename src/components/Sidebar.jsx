import { NavLink } from 'react-router-dom';
import { usePods } from '../hooks/usePods';

export default function Sidebar() {
    const { pods, loading } = usePods();

    const linkClasses = ({ isActive }) =>
        `block px-3 py-2 rounded text-sm transition-colors ${isActive
            ? 'bg-indigo-50 text-indigo-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100'
        }`;

    return (
        <aside className="w-60 border-r border-gray-200 bg-gray-50 h-full flex flex-col">
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <NavLink to="/dashboard" className={linkClasses} end>
                    Dashboard
                </NavLink>

                <div className="pt-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                        Pods
                    </h3>
                    {loading ? (
                        <p className="text-xs text-gray-400 px-3">Loading...</p>
                    ) : pods.length === 0 ? (
                        <p className="text-xs text-gray-400 px-3">No pods yet</p>
                    ) : (
                        pods.map((pod) => (
                            <NavLink
                                key={pod.id}
                                to={`/pod/${pod.id}`}
                                className={linkClasses}
                            >
                                {pod.name}
                            </NavLink>
                        ))
                    )}
                </div>
            </nav>
        </aside>
    );
}
