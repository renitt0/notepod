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

    const createPod = async (name, description = '') => {
        if (!user) return;
        try {
            const insertPayload = { name };
            if (description.trim()) insertPayload.description = description.trim();

            const { data, error } = await supabase
                .from('pods')
                .insert([insertPayload])
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

    // ─── Member Management ───────────────────────────────────────────────────

    /**
     * Fetch all members of a pod with their profile info.
     */
    const fetchPodMembers = async (podId) => {
        const { data, error } = await supabase
            .from('pod_members')
            .select('id, role, user_id, profiles(id, username, avatar_url)')
            .eq('pod_id', podId);

        if (error) throw error;

        // Flatten profile data into each member entry
        return (data || []).map(m => ({
            id: m.id,
            userId: m.user_id,
            role: m.role,
            username: m.profiles?.username ?? '(unknown)',
            avatar_url: m.profiles?.avatar_url ?? null,
        }));
    };

    /**
     * Invite a user to a pod by their username with a given role.
     */
    const addMemberByUsername = async (podId, username, role) => {
        // Look up the user's id from the profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username.trim())
            .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData) throw new Error(`No user found with username "@${username}"`);

        // Check if already a member
        const { data: existing } = await supabase
            .from('pod_members')
            .select('id')
            .eq('pod_id', podId)
            .eq('user_id', profileData.id)
            .maybeSingle();

        if (existing) throw new Error(`@${username} is already a member of this pod.`);

        const { error: insertError } = await supabase
            .from('pod_members')
            .insert([{ pod_id: podId, user_id: profileData.id, role }]);

        if (insertError) throw insertError;
    };

    /**
     * Remove a member from a pod (by pod_member row id).
     */
    const removeMember = async (podId, memberId) => {
        const { error } = await supabase
            .from('pod_members')
            .delete()
            .eq('id', memberId)
            .eq('pod_id', podId);

        if (error) throw error;
    };

    /**
     * Update the role of an existing pod member.
     */
    const updateMemberRole = async (podId, memberId, newRole) => {
        const { error } = await supabase
            .from('pod_members')
            .update({ role: newRole })
            .eq('id', memberId)
            .eq('pod_id', podId);

        if (error) throw error;
    };

    useEffect(() => {
        fetchPods();
    }, [fetchPods]);

    return {
        pods, loading, error,
        createPod, deletePod, fetchPods,
        fetchPodMembers, addMemberByUsername, removeMember, updateMemberRole,
    };
}
