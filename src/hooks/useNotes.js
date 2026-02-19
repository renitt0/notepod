import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from './useAuth';

export function useNotes(podId = null) {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotes = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        let query = supabase.from('notes').select('*');

        if (podId) {
            query = query.eq('pod_id', podId);
        } else {
            // Personal notes — notes owned by this user
            query = query.eq('owner_id', user.id);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching notes:', error);
        } else {
            setNotes(data ?? []);
        }
        setLoading(false);
    }, [user, podId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const createNote = async ({ title, content, pod_id }) => {
        const { data, error } = await supabase
            .from('notes')
            .insert({
                title,
                content,
                pod_id: pod_id ?? podId,
                owner_id: user.id,
            })
            .select()
            .single();

        if (error) throw error;
        await fetchNotes();
        return data;
    };

    const updateNote = async (noteId, { title, content }) => {
        // Fetch current version before updating to snapshot history
        const { data: current, error: fetchError } = await supabase
            .from('notes')
            .select('content')
            .eq('id', noteId)
            .single();

        if (fetchError) throw fetchError;

        // Insert previous version into note_history
        const { error: historyError } = await supabase
            .from('note_history')
            .insert({
                note_id: noteId,
                edited_by: user.id,
                content_snapshot: current.content,
            });

        if (historyError) throw historyError;

        // Now update the note
        const { data, error } = await supabase
            .from('notes')
            .update({ title, content })
            .eq('id', noteId)
            .select()
            .single();

        if (error) throw error;
        await fetchNotes();
        return data;
    };

    const deleteNote = async (noteId) => {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId);

        if (error) throw error;
        await fetchNotes();
    };

    return {
        notes,
        loading,
        fetchNotes,
        createNote,
        updateNote,
        deleteNote,
    };
}
