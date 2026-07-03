import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  X,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import SideDrawer from '../layout/SideDrawer'
import { getUniqueFilterOptions } from '../../services/api'

const filterConfig = [
  { key: 'endYear', label: 'End Year', type: 'select', optionsKey: 'endYears' },
  { key: 'topics', label: 'Topics', type: 'multi' },
  { key: 'sectors', label: 'Sector', type: 'multi' },
  { key: 'regions', label: 'Region', type: 'multi' },
  { key: 'pestle', label: 'PESTLE', type: 'multi' },
  { key: 'source', label: 'Source', type: 'searchable' },
  { key: 'countries', label: 'Country', type: 'searchable-multi' },
  { key: 'swot', label: 'SWOT', type: 'multi' },
  { key: 'city', label: 'City', type: 'searchable' },
]

function DropdownPortal({ open, anchorEl, children, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (open && anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      setPos({ top: rect.bottom + 6, left: rect.left })
    }
  }, [open, anchorEl])

  useEffect(() => {
    if (!open) return
    const handleScroll = () => {
      if (anchorEl) {
        const rect = anchorEl.getBoundingClientRect()
        setPos({ top: rect.bottom + 6, left: rect.left })
      }
    }
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [open, anchorEl])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999]" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[10000]"
        style={{ top: pos.top, left: pos.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>,
    document.body
  )
}

export default function FilterBar() {
  const [options, setOptions] = useState(null)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [searchText, setSearchText] = useState({})
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const buttonRefs = useRef({})
  const filters = useFilterStore()
  const { recentlyApplied } = useFilterStore()
  const activeCount = filters.getActiveFilterCount()

  useEffect(() => {
    getUniqueFilterOptions().then(setOptions)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (openDropdown && !e.target.closest('[data-dropdown-btn]')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [openDropdown])

  const toggleDropdown = useCallback((key) => {
    if (openDropdown === key) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(key)
      setAnchorEl(buttonRefs.current[key])
    }
  }, [openDropdown])

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null)
  }, [])

  const handleSelect = (key, value) => {
    if (key === 'endYear') {
      filters.setFilter('endYear', filters.endYear === value ? '' : value)
    }
    closeDropdown()
  }

  const handleMultiSelect = (key, value) => {
    const current = filters[key] || []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    filters.setFilter(key, next)
  }

  const handleSearchableSelect = (value) => {
    filters.setFilter('source', filters.source === value ? '' : value)
    closeDropdown()
  }

  const handleSearchableMultiSelect = (value) => {
    const current = filters.countries || []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    filters.setFilter('countries', next)
  }

  const getOptions = (cfg) => {
    if (!options) return []
    if (cfg.optionsKey) return options[cfg.optionsKey] || []
    return options[cfg.key] || []
  }

  const getFilterLabel = (key) => {
    const cfg = filterConfig.find((f) => f.key === key)
    if (!cfg) return ''
    const val = filters[key]
    if (!val || (Array.isArray(val) && val.length === 0)) return ''
    if (typeof val === 'string') return val
    return `${val.length} selected`
  }

  const renderDropdownContent = (cfg) => (
    <div className="bg-surface border border-subtle rounded-xl shadow-md overflow-hidden min-w-[140px] max-w-[220px] max-h-[280px] flex flex-col">
      {(cfg.type === 'searchable' || cfg.type === 'searchable-multi') && (
        <div className="p-2 border-b border-subtle">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-base border border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-1/40"
              value={searchText[cfg.key] || ''}
              onChange={(e) => setSearchText({ ...searchText, [cfg.key]: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      <div className="overflow-auto p-1.5">
        {(cfg.type === 'multi' || cfg.type === 'searchable-multi'
          ? getOptions(cfg).filter((o) =>
              !searchText[cfg.key] || o.toLowerCase().includes(searchText[cfg.key].toLowerCase())
            )
          : [{ value: '', label: 'All' }, ...getOptions(cfg).map((o) => ({ value: o, label: o }))]
        ).map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value
          const label = typeof opt === 'string' ? opt : opt.label
          const isSelected = cfg.type === 'multi' || cfg.type === 'searchable-multi'
            ? (filters[cfg.key] || []).includes(val)
            : filters[cfg.key] === val
          return (
            <button
              key={val}
              onClick={() => {
                if (cfg.type === 'multi') handleMultiSelect(cfg.key, val)
                else if (cfg.type === 'searchable-multi') handleSearchableMultiSelect(val)
                else handleSelect(cfg.key, val)
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                isSelected
                  ? 'bg-accent-1/10 text-accent-1'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              {val || '(All)'}
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderMobileFilter = (cfg) => {
    const opts = getOptions(cfg)
    return (
      <div key={cfg.key} className="mb-4">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">{cfg.label}</p>
        <div className="flex flex-wrap gap-1.5">
          {cfg.type === 'select' && (
            <select
              value={filters[cfg.key]}
              onChange={(e) => filters.setFilter(cfg.key, e.target.value)}
              className="w-full bg-surface-elevated/70 border border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-1/40"
            >
              <option value="">All</option>
              {opts.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}
          {(cfg.type === 'multi' || cfg.type === 'searchable-multi') && opts.map((o) => {
            const selected = (filters[cfg.key] || []).includes(o)
            return (
              <button
                key={o}
                onClick={() => handleMultiSelect(cfg.key, o)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                  selected
                    ? 'bg-accent-1/10 border-accent-1/30 text-accent-1'
                    : 'bg-surface-elevated/50 border-subtle text-text-secondary hover:border-hover hover:text-text-primary'
                }`}
              >
                {o}
              </button>
            )
          })}
          {cfg.type === 'searchable' && (
            <select
              value={filters[cfg.key]}
              onChange={(e) => filters.setFilter(cfg.key, e.target.value)}
              className="w-full bg-surface-elevated/70 border border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-1/40"
            >
              <option value="">All</option>
              {opts.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop filter bar */}
      <div className="hidden md:block border-b border-subtle bg-surface/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 lg:px-6 py-2.5 overflow-visible">
          <div className="flex items-center gap-1.5 shrink-0 mr-1">
            <SlidersHorizontal size={14} className="text-text-muted" />
            <span className="text-xs font-medium text-text-secondary">Filters</span>
            {activeCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-1/15 text-accent-1 text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {filterConfig.map((cfg) => {
              const isPulsing = recentlyApplied?.key === cfg.key && (
                Array.isArray(filters[cfg.key])
                  ? filters[cfg.key].includes(recentlyApplied?.value)
                  : filters[cfg.key] === recentlyApplied?.value
              )
              return (
              <div key={`${cfg.key}${isPulsing ? recentlyApplied.id : ''}`} className="relative shrink-0">
                <button
                  data-dropdown-btn
                  ref={(el) => { buttonRefs.current[cfg.key] = el }}
                  onClick={() => toggleDropdown(cfg.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 whitespace-nowrap ${isPulsing ? 'filter-pulse-once ' : ''}${
                    getFilterLabel(cfg.key)
                      ? 'bg-accent-1/10 border-accent-1/30 text-accent-1'
                      : 'bg-surface-elevated/50 border border-subtle text-text-secondary hover:border-hover hover:text-text-primary'
                  }`}
                >
                  {cfg.label}
                  {(filters[cfg.key]?.length || filters[cfg.key]) && (
                    <span className="ml-1 opacity-70 max-w-[80px] truncate">
                      {getFilterLabel(cfg.key)}
                    </span>
                  )}
                  <ChevronDown size={12} />
                </button>

                <DropdownPortal
                  open={openDropdown === cfg.key}
                  anchorEl={anchorEl}
                  onClose={closeDropdown}
                >
                  {renderDropdownContent(cfg)}
                </DropdownPortal>
              </div>
            )
            })}
          </div>

          {activeCount > 0 && (
            <button
              onClick={filters.clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-danger hover:bg-danger/10 border border-danger/20 whitespace-nowrap transition-all duration-150 shrink-0"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter button */}
      <div className="md:hidden border-b border-subtle bg-surface/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button
            onClick={() => setMobileSheetOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-1/10 border border-accent-1/20 text-accent-1 text-sm font-medium transition-all duration-150"
          >
            <Filter size={16} />
            Filters
            {activeCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent-1 text-white text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </button>
          {activeCount > 0 && (
            <button
              onClick={filters.clearFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-danger hover:bg-danger/10 border border-danger/20 transition-all duration-150"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <SideDrawer open={mobileSheetOpen} onClose={() => setMobileSheetOpen(false)} from="bottom" maxHeight="85vh">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-subtle shrink-0">
            <span className="font-display font-semibold text-text-primary text-sm">Filters</span>
            <button
              onClick={() => setMobileSheetOpen(false)}
              className="p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
            >
              <X size={18} />
            </button>
          </div>
          <div className="overflow-auto p-4 flex-1">
            <div className="space-y-1">
              {filterConfig.map((cfg) => renderMobileFilter(cfg))}
            </div>
          </div>
          <div className="border-t border-subtle px-4 py-3 flex gap-3 shrink-0">
            <button
              onClick={filters.clearFilters}
              className="flex-1 px-4 py-2.5 rounded-xl border border-subtle text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all duration-150"
            >
              Clear all
            </button>
            <button
              onClick={() => setMobileSheetOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-accent-1 text-white text-sm font-medium hover:bg-accent-1/90 transition-all duration-150"
            >
              Apply
            </button>
          </div>
        </div>
      </SideDrawer>
    </>
  )
}
