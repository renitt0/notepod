import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile — fire-and-forget, never blocks auth flow
    const fetchProfile = (userId) => {
        supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    console.warn('[Notepod] Profile fetch skipped:', error.message);
                    setProfile(null);
                } else {
                    setProfile(data);
                }
            })
            .catch((err) => {
                console.warn('[Notepod] Profile fetch error:', err.message);
                setProfile(null);
            });
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                fetchProfile(currentUser.id);
            }
            setLoading(false);
        });

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                if (currentUser) {
                    fetchProfile(currentUser.id);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, username) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Attempt to create profile — don't block auth flow
        if (data.user) {
            supabase
                .from('profiles')
                .insert({ id: data.user.id, username, email })
                .then(({ error: profileError }) => {
                    if (profileError) {
                        console.warn('[Notepod] Profile insert failed:', profileError.message);
                    }
                });
        }

        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setProfile(null);
    };

    const value = {
        user,
        profile,
        setProfile,
        loading,
        signUp,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
