import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from './useAuth';

export function useNotes(podId = null) {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotes = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            let query = supabase
                .from('notes')
                .select('*')
                .order('updated_at', { ascending: false });

            if (podId) {
                query = query.eq('pod_id', podId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setNotes(data || []);
        } catch (err) {
            console.error('Error fetching notes:', err);
            setError(err.message);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    }, [user, podId]);

    // Auto-fetch on mount and when dependencies change
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const createNote = async (title, content, podIdOverride = null) => {
        if (!user) return;
        try {
            const targetPodId = podIdOverride || podId;
            const insertData = { title, content };
            if (targetPodId) insertData.pod_id = targetPodId;

            const { data, error } = await supabase
                .from('notes')
                .insert([insertData])
                .select()
                .single();

            if (error) throw error;
            setNotes((prev) => [data, ...prev]);
            return data;
        } catch (err) {
            console.error('Error creating note:', err);
            throw err;
        }
    };

    const updateNote = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('notes')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setNotes((prev) => prev.map(n => n.id === id ? data : n));
            return data;
        } catch (err) {
            console.error('Error updating note:', err);
            throw err;
        }
    };

    const deleteNote = async (id) => {
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setNotes((prev) => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Error deleting note:', err);
            throw err;
        }
    };

    return { notes, loading, error, fetchNotes, createNote, updateNote, deleteNote };
}
