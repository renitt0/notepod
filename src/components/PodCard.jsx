import { Link } from 'react-router-dom';
import { getRoleLabel } from '../utils/roleHelpers';

const POD_GRADIENTS = [
    'from-violet-500/20 to-fuchsia-500/10',
    'from-blue-500/20 to-cyan-500/10',
    'from-amber-500/20 to-orange-500/10',
    'from-emerald-500/20 to-teal-500/10',
    'from-rose-500/20 to-pink-500/10',
    'from-indigo-500/20 to-blue-500/10',
];

const POD_ICON_COLORS = [
    'text-violet-500',
    'text-blue-500',
    'text-amber-500',
    'text-emerald-500',
    'text-rose-500',
    'text-indigo-500',
];

// Deterministic gradient from pod id
function getPodStyle(podId) {
    // Use the last char of the ID to pick a consistent gradient
    const idx = (podId?.charCodeAt(podId?.length - 1) ?? 0) % POD_GRADIENTS.length;
    return { gradient: POD_GRADIENTS[idx], iconColor: POD_ICON_COLORS[idx] };
}

export default function PodCard({ pod }) {
    const { gradient, iconColor } = getPodStyle(pod.id);

    return (
        <Link
            to={`/pod/${pod.id}`}
            className="group block bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all"
        >
            {/* Gradient header */}
            <div className={`h-20 w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[36px] ${iconColor} drop-shadow`}>
                    folder_open
                </span>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate text-sm">
                    {pod.name}
                </h3>
                {pod.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {pod.description}
                    </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                        {getRoleLabel(pod.role)}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-primary transition-colors">
                        arrow_forward
                    </span>
                </div>
            </div>
        </Link>
    );
}
