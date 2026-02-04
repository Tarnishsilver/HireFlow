import { create } from 'zustand';

interface DemoConfig {
    interviewType: 'Startup' | 'Enterprise' | 'FAANG';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    durationMinutes: number;
}

interface DemoState {
    isAnonymousMode: boolean;
    toggleAnonymousMode: () => void;

    config: DemoConfig;
    updateConfig: (updates: Partial<DemoConfig>) => void;

    isDemoMode: boolean; // General toggle for demo UI overlays if needed
    toggleDemoMode: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
    isAnonymousMode: false,
    toggleAnonymousMode: () => set((state) => ({ isAnonymousMode: !state.isAnonymousMode })),

    config: {
        interviewType: 'Startup',
        difficulty: 'Medium',
        durationMinutes: 30,
    },
    updateConfig: (updates) => set((state) => ({ config: { ...state.config, ...updates } })),

    isDemoMode: true,
    toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
}));
