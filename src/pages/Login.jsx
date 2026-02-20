import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const { signIn, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            await signIn(email, password);
            // Don't navigate here — useEffect above will handle it
            // once onAuthStateChange fires and user state updates
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
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Your collaborative thoughts, organized.</p>
                </div>

                {/* Main Auth Card */}
                <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Welcome Text */}
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please enter your details to sign in.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="space-y-4">
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
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                    <a className="text-xs font-bold text-primary hover:underline" href="#">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        type="password"
                                        required
                                    />
                                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button disabled={loading} className="w-full h-14 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-full transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70">
                            {loading ? 'Signing in...' : 'Sign in'}
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center py-2 mt-4">
                        <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                        <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                        <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <button className="flex items-center justify-center gap-3 h-12 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-semibold text-sm">
                            Google
                        </button>
                        <button className="flex items-center justify-center gap-3 h-12 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-semibold text-sm">
                            GitHub
                        </button>
                    </div>
                </div>

                {/* Secondary Footer Link */}
                <p className="text-center mt-8 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Don't have an account?
                    <Link to="/signup" className="text-primary font-bold hover:underline ml-1">Create an account</Link>
                </p>

                {/* Dynamic Decorative Background Elements */}
                <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden opacity-50 pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
                    <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]"></div>
                </div>
            </div>
        </div>
    );
}
