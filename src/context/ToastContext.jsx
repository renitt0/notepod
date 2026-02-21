import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

const ICONS = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warn: 'warning',
};

const COLORS = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400',
    warn: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400',
};

let nextId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = ++nextId;
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => dismiss(id), duration);
        }
        return id;
    }, [dismiss]);

    const toast = {
        success: (msg, dur) => addToast(msg, 'success', dur),
        error: (msg, dur) => addToast(msg, 'error', dur ?? 5000),
        info: (msg, dur) => addToast(msg, 'info', dur),
        warn: (msg, dur) => addToast(msg, 'warn', dur),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast container */}
            <div
                aria-live="polite"
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none w-full max-w-sm px-4"
            >
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-3 w-full px-4 py-3 rounded-2xl border shadow-xl shadow-black/10 backdrop-blur-md text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300 ${COLORS[t.type]}`}
                    >
                        <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                            {ICONS[t.type]}
                        </span>
                        <span className="flex-1 leading-snug">{t.message}</span>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-1"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
