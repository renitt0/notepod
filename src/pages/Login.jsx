import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../api/supabaseClient';

export default function Login() {
    const { signIn, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Forgot password state
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState(null);

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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail.trim()) return;
        setForgotLoading(true);
        setForgotMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setForgotMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' });
        } catch (err) {
            setForgotMessage({ type: 'error', text: err.message });
        } finally {
            setForgotLoading(false);
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

                {/* Forgot Password Panel */}
                {showForgot ? (
                    <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => { setShowForgot(false); setForgotMessage(null); }}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-6 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Back to sign in
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Reset password</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">We'll send a reset link to your email address.</p>

                        {forgotMessage && (
                            <div className={`p-3 rounded-xl text-sm mb-4 flex items-center gap-2 ${forgotMessage.type === 'success'
                                ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-100 dark:border-green-500/20'
                                : 'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20'
                                }`}>
                                <span className="material-symbols-outlined text-[18px]">
                                    {forgotMessage.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {forgotMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                                <input
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                    placeholder="name@company.com"
                                    type="email"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-full transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {forgotLoading ? 'Sending...' : 'Send reset link'}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* Main Auth Card */
                    <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Welcome Text */}
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please enter your details to sign in.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-500/10 text-red-500 text-sm p-3 rounded-xl border border-red-100 dark:border-red-500/20 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
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
                                        <button
                                            type="button"
                                            onClick={() => setShowForgot(true)}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
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

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-full transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                                {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
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
                            <button
                                type="button"
                                onClick={async () => {
                                    await supabase.auth.signInWithOAuth({ provider: 'google' });
                                }}
                                className="flex items-center justify-center gap-3 h-12 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-semibold text-sm"
                            >
                                <svg className="size-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await supabase.auth.signInWithOAuth({ provider: 'github' });
                                }}
                                className="flex items-center justify-center gap-3 h-12 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-semibold text-sm"
                            >
                                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </button>
                        </div>
                    </div>
                )}

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
