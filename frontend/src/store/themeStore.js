import { create } from 'zustand'

const STORAGE_KEY = 'blackcoffer_theme'

function getInitialDark() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'dark'
  } catch {}
  return false
}

function persist(dark) {
  try {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  } catch {}
}

export const useThemeStore = create((set) => ({
  dark: getInitialDark(),
  sidebarCollapsed: false,
  toggleDark: () =>
    set((s) => {
      const next = !s.dark
      persist(next)
      return { dark: next }
    }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: val }),
}))
