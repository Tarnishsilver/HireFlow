import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'HR' | 'CANDIDATE';

interface RoleState {
    currentRole: UserRole;
    setRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
    currentRole: 'HR', // Default start state for demo
    setRole: (role) => set({ currentRole: role }),
}));
