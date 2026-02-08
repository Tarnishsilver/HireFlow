'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NavbarPosition = 'top' | 'left';

interface UIStore {
    navbarPosition: NavbarPosition;
    setNavbarPosition: (position: NavbarPosition) => void;
    toggleNavbarPosition: () => void;
}

export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            navbarPosition: 'top',
            setNavbarPosition: (position) => set({ navbarPosition: position }),
            toggleNavbarPosition: () => set((state) => ({
                navbarPosition: state.navbarPosition === 'top' ? 'left' : 'top'
            })),
        }),
        {
            name: 'ui-storage',
        }
    )
);
