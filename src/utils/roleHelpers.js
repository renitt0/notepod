export const ROLES = {
    CREATOR: 'creator',
    ADMIN: 'admin',
    EDITOR: 'editor',
    READ_ONLY: 'read_only',
};

const ROLE_HIERARCHY = [ROLES.CREATOR, ROLES.ADMIN, ROLES.EDITOR, ROLES.READ_ONLY];

/**
 * Check if a role has at least the given minimum permission level.
 */
export function hasMinRole(userRole, minRole) {
    const userIndex = ROLE_HIERARCHY.indexOf(userRole);
    const minIndex = ROLE_HIERARCHY.indexOf(minRole);
    if (userIndex === -1 || minIndex === -1) return false;
    return userIndex <= minIndex;
}

export function canEdit(role) {
    return hasMinRole(role, ROLES.EDITOR);
}

export function canManageMembers(role) {
    return hasMinRole(role, ROLES.ADMIN);
}

export function isCreator(role) {
    return role === ROLES.CREATOR;
}

export function getRoleLabel(role) {
    const labels = {
        [ROLES.CREATOR]: 'Creator',
        [ROLES.ADMIN]: 'Admin',
        [ROLES.EDITOR]: 'Editor',
        [ROLES.READ_ONLY]: 'Read Only',
    };
    return labels[role] ?? role;
}
