import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from './useAuth';

export function useNotes(podId = null) {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const channelRef = useRef(null);

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

    // Realtime subscription for live collaboration
    useEffect(() => {
        if (!user) return;

        // Clear any existing channel before creating a new one
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channelName = podId ? `notes-pod-${podId}` : 'notes-all';
        const filter = podId ? `pod_id=eq.${podId}` : undefined;

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notes', ...(filter ? { filter } : {}) },
                (payload) => {
                    setNotes(prev => {
                        // Avoid duplicate if we already have it (from optimistic update)
                        if (prev.some(n => n.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'notes', ...(filter ? { filter } : {}) },
                (payload) => {
                    setNotes(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'notes', ...(filter ? { filter } : {}) },
                (payload) => {
                    setNotes(prev => prev.filter(n => n.id !== payload.old.id));
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [user, podId]);

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
            // Optimistically add — realtime will deduplicate
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
