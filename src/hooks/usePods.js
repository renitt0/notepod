import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from './useAuth';

export function usePods() {
    const { user } = useAuth();
    const [pods, setPods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPods = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            // Simple fetch — no ordering assumptions about column names
            const { data, error } = await supabase
                .from('pods')
                .select('*');

            if (error) throw error;
            setPods(data || []);
        } catch (err) {
            console.error('Error fetching pods:', err);
            setError(err.message);
            setPods([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const createPod = async (name) => {
        if (!user) return;
        try {
            // Only insert the name — the simplest possible insert
            const { data, error } = await supabase
                .from('pods')
                .insert([{ name }])
                .select()
                .single();

            if (error) throw error;
            setPods((prev) => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error creating pod:', err);
            throw err;
        }
    };

    const deletePod = async (id) => {
        try {
            const { error } = await supabase
                .from('pods')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setPods((prev) => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting pod:', err);
            throw err;
        }
    };

    useEffect(() => {
        fetchPods();
    }, [fetchPods]);

    return { pods, loading, error, createPod, deletePod, fetchPods };
}
