import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { useAuth } from './useAuth';

export function usePods() {
    const { user } = useAuth();
    const [pods, setPods] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPods = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('pod_members')
            .select('pod_id, role, pods(id, name, created_by)')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching pods:', error);
        } else {
            setPods(data.map((pm) => ({ ...pm.pods, role: pm.role })));
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchPods();
    }, [fetchPods]);

    const createPod = async (name) => {
        const { data, error } = await supabase
            .from('pods')
            .insert({ name, created_by: user.id })
            .select()
            .single();

        if (error) throw error;

        // Auto-insert creator as pod member with 'creator' role
        const { error: memberError } = await supabase
            .from('pod_members')
            .insert({ pod_id: data.id, user_id: user.id, role: 'creator' });

        if (memberError) throw memberError;

        await fetchPods();
        return data;
    };

    const fetchPodMembers = async (podId) => {
        const { data, error } = await supabase
            .from('pod_members')
            .select('user_id, role, profiles(id, username)')
            .eq('pod_id', podId);

        if (error) throw error;
        return data.map((pm) => ({ ...pm.profiles, role: pm.role }));
    };

    const addMemberByUsername = async (podId, username, role = 'read_only') => {
        // Look up user by username
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

        if (profileError) throw new Error('User not found');

        const { error } = await supabase
            .from('pod_members')
            .insert({ pod_id: podId, user_id: profile.id, role });

        if (error) throw error;
    };

    const removeMember = async (podId, userId) => {
        const { error } = await supabase
            .from('pod_members')
            .delete()
            .eq('pod_id', podId)
            .eq('user_id', userId);

        if (error) throw error;
    };

    const updateMemberRole = async (podId, userId, newRole) => {
        const { error } = await supabase
            .from('pod_members')
            .update({ role: newRole })
            .eq('pod_id', podId)
            .eq('user_id', userId);

        if (error) throw error;
    };

    return {
        pods,
        loading,
        fetchPods,
        createPod,
        fetchPodMembers,
        addMemberByUsername,
        removeMember,
        updateMemberRole,
    };
}
