export default function Loader({ fullScreen = false, text = 'Loading...' }) {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center size-16">
                {/* Background Ring */}
                <svg className="absolute inset-0 size-full text-slate-200 dark:text-slate-800" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
                {/* Rotating Ring */}
                <svg className="absolute inset-0 size-full text-primary animate-spin" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="180" strokeLinecap="round" />
                </svg>
                {/* Center Icon (SVG Path) */}
                <svg className="absolute size-8 text-primary animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5.5l6-3.75-6-3.75v7.5z" />
                </svg>
            </div>
            {text && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return <div className="flex items-center justify-center py-12">{content}</div>;
}
