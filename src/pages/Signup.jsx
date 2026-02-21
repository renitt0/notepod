import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
    const { signUp, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Redirect when auth state confirms the user is logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signUp(email, password, username);
            // useEffect above will redirect once auth state updates
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display flex min-h-screen items-center justify-center p-6 selection:bg-primary/30">
            <div className="w-full max-w-[480px]">
                {/* Brand Logo Header */}
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="size-14 bg-primary rounded-xl flex items-center justify-center text-background-light mb-4 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined !text-4xl">edit_note</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">PodNotes</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Join the collaborative workspace.</p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create Account</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start organizing your thoughts today.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 text-red-500 text-sm p-3 rounded-xl border border-red-100 dark:border-red-500/20 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Username</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                                    <input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        placeholder="johndoe"
                                        type="text"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email address</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        placeholder="name@company.com"
                                        type="email"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-full transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70">
                            {loading ? 'Creating account...' : 'Create Account'}
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </form>

                    <p className="text-center mt-8 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Already have an account?
                        <Link to="/login" className="text-primary font-bold hover:underline ml-1">Sign in</Link>
                    </p>
                </div>

                <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden opacity-50 pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
                    <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]"></div>
                </div>
            </div>
        </div>
    );
}
