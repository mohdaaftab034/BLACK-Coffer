import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  FileText,
  PieChart,
  Globe2,
  Tag,
  MapPin,
  SlidersHorizontal,
  Filter,
} from 'lucide-react'
import { useSearchStore } from '../../store/searchStore'
import { useFilterStore } from '../../store/filterStore'
import { getFilteredData, getUniqueFilterOptions } from '../../services/api'

const CATEGORY_ICONS = {
  insights: FileText,
  sectors: PieChart,
  countries: Globe2,
  topics: Tag,
  regions: MapPin,
  pestle: SlidersHorizontal,
  source: Filter,
}

const CATEGORY_LABELS = {
  insights: 'Insights',
  sectors: 'Sectors',
  countries: 'Countries',
  topics: 'Topics',
  regions: 'Regions',
  pestle: 'PEST',
  source: 'Sources',
}

const FILTERABLE_PATHS = ['/', '/insights', '/geography', '/sectors']

const NAV_MAP = {
  sectors: '/sectors',
  topics: '/sectors',
  countries: '/geography',
  regions: '/geography',
}

function HighlightText({ text, query }) {
  if (!query || !text) return <>{text}</>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-accent-1/20 text-accent-1 rounded-sm px-0.5 font-medium">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

function ResultSkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-4 py-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-elevated/50" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-surface-elevated/50 rounded w-3/4" />
            <div className="h-2 bg-surface-elevated/40 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SearchOverlay() {
  const { isOpen, close } = useSearchStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const pulseTimerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [filterOptions, setFilterOptions] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const debounceRef = useRef(null)

  useEffect(() => {
    getUniqueFilterOptions().then(setFilterOptions)
  }, [])

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current)
    }
  }, [])

  const applyFilterAction = useCallback((key, value) => {
    const filterStore = useFilterStore.getState()
    if (key === 'source') {
      filterStore.setFilter('source', value)
    } else {
      filterStore.setFilter(key, [value])
    }
    filterStore.setRecentlyApplied(key, value)

    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current)
    pulseTimerRef.current = setTimeout(() => {
      useFilterStore.getState().clearRecentlyApplied()
    }, 2000)

    close()

    if (!FILTERABLE_PATHS.includes(pathname)) {
      navigate(NAV_MAP[key] || '/')
    }
  }, [close, navigate, pathname])

  const flatResults = useMemo(() => {
    const results = []
    let idx = 0

    if (query && filterOptions) {
      const sectors = (filterOptions.sectors || [])
        .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
      sectors.forEach((s) => {
        results.push({
          index: idx++,
          id: `sector-${s}`,
          type: 'sectors',
          label: s,
          subtitle: `Filter by Sector`,
          icon: PieChart,
          action: () => applyFilterAction('sectors', s),
        })
      })

      const countries = (filterOptions.countries || [])
        .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
      countries.forEach((c) => {
        results.push({
          index: idx++,
          id: `country-${c}`,
          type: 'countries',
          label: c,
          subtitle: `Filter by Country`,
          icon: Globe2,
          action: () => applyFilterAction('countries', c),
        })
      })

      const topics = (filterOptions.topics || [])
        .filter((t) => t.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
      topics.forEach((t) => {
        results.push({
          index: idx++,
          id: `topic-${t}`,
          type: 'topics',
          label: t,
          subtitle: `Filter by Topic`,
          icon: Tag,
          action: () => applyFilterAction('topics', t),
        })
      })

      const regions = (filterOptions.regions || [])
        .filter((r) => r.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
      regions.forEach((r) => {
        results.push({
          index: idx++,
          id: `region-${r}`,
          type: 'regions',
          label: r,
          subtitle: `Filter by Region`,
          icon: MapPin,
          action: () => applyFilterAction('regions', r),
        })
      })

      const pestle = (filterOptions.pestle || [])
        .filter((p) => p.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
      pestle.forEach((p) => {
        results.push({
          index: idx++,
          id: `pestle-${p}`,
          type: 'pestle',
          label: p,
          subtitle: `Filter by PEST`,
          icon: SlidersHorizontal,
          action: () => applyFilterAction('pestle', p),
        })
      })

      const source = (filterOptions.source || [])
        .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
      source.forEach((s) => {
        results.push({
          index: idx++,
          id: `source-${s}`,
          type: 'source',
          label: s,
          subtitle: `Filter by Source`,
          icon: Filter,
          action: () => applyFilterAction('source', s),
        })
      })
    }

    if (insights.length) {
      insights.forEach((d) => {
        results.push({
          index: idx++,
          id: `insight-${d._id || idx}`,
          type: 'insights',
          label: d.title || d.insight || 'Untitled',
          subtitle: [d.sector, d.country, d.region].filter(Boolean).join(' · '),
          icon: FileText,
          action: () => {
            close()
            navigate('/insights')
          },
        })
      })
    }

    return results
  }, [insights, query, filterOptions, close, navigate, applyFilterAction])

  const groupedResults = useMemo(() => {
    const groups = {}
    flatResults.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = []
      groups[r.type].push(r)
    })
    return groups
  }, [flatResults])

  const totalResults = flatResults.length

  const fetchSearch = useCallback((q) => {
    if (!q.trim()) {
      setInsights([])
      setLoading(false)
      return
    }
    setLoading(true)
    getFilteredData({ search: q.trim(), limit: 20 })
      .then((data) => {
        setInsights(data || [])
        setLoading(false)
      })
      .catch(() => {
        setInsights([])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    setSelectedIndex(0)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setInsights([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(() => fetchSearch(query), 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchSearch])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isOpen) {
      setQuery('')
      setInsights([])
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(totalResults, 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + Math.max(totalResults, 1)) % Math.max(totalResults, 1))
    }
    if (e.key === 'Enter' && totalResults > 0) {
      e.preventDefault()
      const selected = flatResults[selectedIndex]
      if (selected) selected.action()
    }
    if (e.key === 'Tab') {
      e.preventDefault()
    }
  }, [close, totalResults, flatResults, selectedIndex])

  useEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (!el) return
    const selected = el.querySelector(`[data-index="${selectedIndex}"]`)
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex, isOpen])

  const hasResults = totalResults > 0
  const showEmpty = query.trim() && !loading && !hasResults

  const categoryOrder = ['sectors', 'countries', 'topics', 'regions', 'pestle', 'source', 'insights']

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative mt-[10vh] w-full max-w-[640px] mx-4 bg-surface-elevated rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 px-5 h-16">
              <Search size={20} className="text-text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search insights, sectors, countries..."
                className="flex-1 bg-transparent text-base text-text-primary placeholder-text-muted/60 outline-none"
              />
              <kbd
                onClick={close}
                className="cursor-pointer px-2 py-1 rounded-lg bg-surface border border-subtle text-[11px] font-medium text-text-muted hover:text-text-primary hover:border-hover transition-all shrink-0"
              >
                Esc
              </kbd>
            </div>

            {/* Divider */}
            <div className="h-px bg-border-subtle mx-0" />

            {/* Results area */}
            <div ref={listRef} className="overflow-y-auto max-h-[min(60vh,500px)] py-2">
              {/* Loading */}
              {loading && <ResultSkeleton />}

              {/* Empty / initial state */}
              {!query.trim() && !loading && (
                <div className="px-5 py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-accent-1/10 flex items-center justify-center mb-4">
                    <Search size={24} className="text-accent-1" />
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1">Search the dashboard</p>
                  <p className="text-xs text-text-muted max-w-[300px]">
                    Type to search across insights, sectors, countries, topics, and regions
                  </p>
                </div>
              )}

              {/* No results */}
              {showEmpty && (
                <div className="px-5 py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-hover flex items-center justify-center mb-4">
                    <Search size={24} className="text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1">No results for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-text-muted">Try a different search term</p>
                </div>
              )}

              {/* Results */}
              {hasResults && !loading && (
                <div>
                  {categoryOrder.map((cat) => {
                    const items = groupedResults[cat]
                    if (!items?.length) return null
                    return (
                      <div key={cat}>
                        <div className="px-5 py-1.5">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                            {CATEGORY_LABELS[cat] || cat}
                          </span>
                        </div>
                        {items.map((result) => {
                          const isSelected = selectedIndex === result.index
                          const Icon = CATEGORY_ICONS[result.type] || FileText
                          return (
                            <button
                              key={result.id}
                              data-index={result.index}
                              onMouseEnter={() => setSelectedIndex(result.index)}
                              onClick={result.action}
                              className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-100 ${
                                isSelected
                                  ? 'bg-accent-1/10'
                                  : 'hover:bg-surface-hover'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-accent-1/15 text-accent-1' : 'bg-surface text-text-muted'
                              }`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate leading-snug">
                                  <HighlightText text={result.label} query={query} />
                                </p>
                                {result.subtitle && (
                                  <p className="text-xs text-text-muted truncate mt-0.5">
                                    <HighlightText text={result.subtitle} query={query} />
                                  </p>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="h-px bg-border-subtle mx-0" />
            <div className="flex items-center gap-4 px-5 py-2.5">
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-surface border border-subtle text-[9px] font-medium">↑</kbd>
                <kbd className="px-1 py-0.5 rounded bg-surface border border-subtle text-[9px] font-medium">↓</kbd>
                <span className="ml-0.5">to navigate</span>
              </span>
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface border border-subtle text-[9px] font-medium">↵</kbd>
                <span>to select</span>
              </span>
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface border border-subtle text-[9px] font-medium">esc</kbd>
                <span>to close</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
