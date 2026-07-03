import { create } from 'zustand'

const initialState = {
  endYear: '',
  topics: [],
  sectors: [],
  regions: [],
  pestle: [],
  source: '',
  swot: [],
  countries: [],
  city: '',
}

export const useFilterStore = create((set, get) => ({
  ...initialState,
  setFilter: (key, value) => set({ [key]: value }),
  clearFilters: () => set(initialState),
  recentlyApplied: null,
  setRecentlyApplied: (key, value) => set({ recentlyApplied: { key, value, id: Date.now() } }),
  clearRecentlyApplied: () => set({ recentlyApplied: null }),
  getActiveFilterCount: () => {
    const s = get()
    let count = 0
    if (s.endYear) count++
    if (s.topics.length) count++
    if (s.sectors.length) count++
    if (s.regions.length) count++
    if (s.pestle.length) count++
    if (s.source) count++
    if (s.swot.length) count++
    if (s.countries.length) count++
    if (s.city) count++
    return count
  },
}))