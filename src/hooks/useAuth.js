import { useAuthContext } from '../context/AuthContext';

/**
 * Convenience hook that re-exports the auth context.
 * Components should use this instead of importing AuthContext directly.
 */
export function useAuth() {
    return useAuthContext();
}
