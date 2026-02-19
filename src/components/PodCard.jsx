import { useNavigate } from 'react-router-dom';
import { getRoleLabel } from '../utils/roleHelpers';

export default function PodCard({ pod }) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(`/pod/${pod.id}`)}
            className="text-left w-full border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer"
        >
            <h3 className="font-medium text-gray-900">{pod.name}</h3>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {getRoleLabel(pod.role)}
            </span>
        </button>
    );
}
